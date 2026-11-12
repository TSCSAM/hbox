import {
  ProviderConfigService,
  type ProviderConfigLayerSnapshot,
  type ProviderConfigLayerUpdate,
} from "@hbox/provider";
import { NodeHboxBuiltinProviderConfigSource } from "./hbox-builtin-provider-config-source.js";
import {
  EndpointScopedHboxBuiltinSource,
  type EndpointScopedHboxBuiltinSourceOptions,
} from "./endpoint-scoped-hbox-builtin-source.js";
import {
  HboxBuiltinRemoteSynchronizer,
  type HboxBuiltinRemoteSynchronizerOptions,
  type HboxBuiltinRefreshResult,
} from "./hbox-builtin-remote-synchronizer.js";
import {
  NodePersonalProviderConfigRepository,
  type PersonalProviderConfigRecoveryEvent,
} from "./personal-provider-config-repository.js";

export interface NodeProviderConfigRuntimeOptions {
  readonly hboxBuiltinFilePath: string;
  readonly hboxBuiltinActiveFilePath?: string;
  readonly hboxBuiltinRemote?: Omit<HboxBuiltinRemoteSynchronizerOptions, "source">;
  readonly hboxBuiltinEnvironment?: Omit<
    EndpointScopedHboxBuiltinSourceOptions,
    "bundledFilePath"
  >;
  readonly onHboxBuiltinRefreshError?: (error: unknown) => void;
  readonly onPersonalConfigRecovery?: (event: PersonalProviderConfigRecoveryEvent) => void;
  readonly onPersonalConfigPollingError?: (error: unknown) => void;
  readonly personalFilePath: string;
  readonly personalPollingIntervalMs?: number | false;
  readonly importLegacy?: (
    hboxBuiltin: ProviderConfigLayerSnapshot,
  ) => Promise<ProviderConfigLayerUpdate | null>;
  readonly watch?: boolean;
}

/** 组装一个 Node.js 进程内共享的 Hbox Built-in/Personal Config 运行边界。 */
export class NodeProviderConfigRuntime {
  readonly configService: ProviderConfigService;
  readonly #hboxBuiltinSource:
    | NodeHboxBuiltinProviderConfigSource
    | EndpointScopedHboxBuiltinSource;
  readonly #personalRepository: NodePersonalProviderConfigRepository;
  readonly #remoteSynchronizer?: HboxBuiltinRemoteSynchronizer;
  readonly #onRemoteRefreshError?: (error: unknown) => void;
  #startPromise: Promise<void> | null = null;
  #disposed = false;
  readonly #checkListeners = new Set<() => Promise<void>>();
  #checkTimer: ReturnType<typeof setInterval> | null = null;
  #checkInFlight: Promise<void> | null = null;

  constructor(options: NodeProviderConfigRuntimeOptions) {
    this.#hboxBuiltinSource = options.hboxBuiltinEnvironment
      ? new EndpointScopedHboxBuiltinSource({
          bundledFilePath: options.hboxBuiltinFilePath,
          ...options.hboxBuiltinEnvironment,
        })
      : new NodeHboxBuiltinProviderConfigSource({
          bundledFilePath: options.hboxBuiltinFilePath,
          activeFilePath: options.hboxBuiltinActiveFilePath,
          watch: options.watch,
        });
    this.#remoteSynchronizer =
      options.hboxBuiltinRemote &&
      this.#hboxBuiltinSource instanceof NodeHboxBuiltinProviderConfigSource
        ? new HboxBuiltinRemoteSynchronizer({
            source: this.#hboxBuiltinSource,
            ...options.hboxBuiltinRemote,
          })
        : undefined;
    this.#onRemoteRefreshError = options.onHboxBuiltinRefreshError;
    this.#personalRepository = new NodePersonalProviderConfigRepository({
      filePath: options.personalFilePath,
      onRecovery: options.onPersonalConfigRecovery,
      onPollingError: options.onPersonalConfigPollingError,
      pollingIntervalMs: options.personalPollingIntervalMs,
      ...(options.importLegacy
        ? {
            importLegacy: async () => options.importLegacy!(await this.#hboxBuiltinSource.read()),
          }
        : {}),
    });
    this.configService = new ProviderConfigService({
      hboxBuiltinSource: this.#hboxBuiltinSource,
      personalRepository: this.#personalRepository,
    });
  }

  resolveHboxBuiltinActiveFilePath(): Promise<string> {
    return this.#hboxBuiltinSource instanceof NodeHboxBuiltinProviderConfigSource
      ? Promise.resolve(this.#hboxBuiltinSource.activeFilePath)
      : this.#hboxBuiltinSource.resolveActiveFilePath();
  }

  get personalRepository(): import("@hbox/provider").PersonalProviderConfigRepository {
    return this.#personalRepository;
  }

  /** Environment 同一周期检查中恢复未对齐依赖，不被下载 TTL 或失败挡住。 */
  onDidCheckHboxBuiltin(listener: () => Promise<void>): () => void {
    this.#checkListeners.add(listener);
    return () => this.#checkListeners.delete(listener);
  }

  start(): Promise<void> {
    if (this.#disposed) throw new Error("NodeProviderConfigRuntime 已 dispose");
    if (this.#startPromise) return this.#startPromise;
    const startPromise = this.configService.read().then(() => {
      if (this.#disposed) return;
      void this.#checkBackground();
      // Managed Worker 无下载配置也无恢复 owner，不建立周期任务。
      if (
        this.#remoteSynchronizer ||
        this.#hboxBuiltinSource instanceof EndpointScopedHboxBuiltinSource ||
        this.#checkListeners.size > 0
      ) {
        this.#checkTimer = setInterval(() => {
          void this.#checkBackground();
        }, 60_000);
        this.#checkTimer.unref?.();
      }
    });
    this.#startPromise = startPromise;
    void startPromise.catch(() => {
      if (this.#startPromise === startPromise) this.#startPromise = null;
    });
    return startPromise;
  }

  refreshHboxBuiltin(options?: { readonly force?: boolean }): Promise<HboxBuiltinRefreshResult> {
    if (this.#disposed) return Promise.resolve("disposed");
    if (this.#hboxBuiltinSource instanceof EndpointScopedHboxBuiltinSource) {
      return this.#hboxBuiltinSource.refresh(options);
    }
    return this.#remoteSynchronizer?.refresh(options) ?? Promise.resolve("skipped");
  }

  #checkBackground(): Promise<void> {
    if (this.#disposed) return Promise.resolve();
    if (this.#checkInFlight) return this.#checkInFlight;
    const check = Promise.allSettled([
      this.refreshHboxBuiltin(),
      ...[...this.#checkListeners].map((listener) => Promise.resolve().then(listener)),
    ])
      .then((results) => {
        if (this.#disposed) return;
        for (const result of results)
          if (result.status === "rejected") this.#onRemoteRefreshError?.(result.reason);
      })
      .finally(() => {
        if (this.#checkInFlight === check) this.#checkInFlight = null;
      });
    this.#checkInFlight = check;
    return check;
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    if (this.#checkTimer) clearInterval(this.#checkTimer);
    this.#checkTimer = null;
    this.#checkListeners.clear();
    this.#remoteSynchronizer?.dispose();
    this.configService.dispose();
    this.#personalRepository.dispose();
    this.#hboxBuiltinSource.dispose();
  }
}

export function createNodeProviderConfigRuntime(
  options: NodeProviderConfigRuntimeOptions,
): NodeProviderConfigRuntime {
  return new NodeProviderConfigRuntime(options);
}
