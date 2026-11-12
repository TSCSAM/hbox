cmake_minimum_required(VERSION 3.21)

cmake_policy(SET CMP0091 NEW)
project(hbox_native_ugrep LANGUAGES C CXX)

if(NOT MSVC)
  message(FATAL_ERROR "Hbox Windows ugrep must be built with MSVC")
endif()

foreach(source_name UGREP PCRE2 ZLIB BZIP2 ZSTD BROTLI)
  if(NOT DEFINED HBOX_${source_name}_SOURCE_DIR)
    message(FATAL_ERROR "Missing HBOX_${source_name}_SOURCE_DIR")
  endif()
endforeach()

if(NOT DEFINED HBOX_UGREP_OUTPUT_DIR)
  message(FATAL_ERROR "Missing HBOX_UGREP_OUTPUT_DIR")
endif()

set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(BUILD_TESTING OFF CACHE BOOL "" FORCE)

# 随机构建目录不能进入最终 PE，否则同版本工具无法跨 CLI 复用同一份 runtime cache。
if(DEFINED HBOX_BUILD_PATH)
  add_compile_options("/pathmap:${HBOX_BUILD_PATH}=hbox-native-search")
endif()

set(BUILD_STATIC_LIBS ON CACHE BOOL "" FORCE)
set(PCRE2_BUILD_PCRE2_8 ON CACHE BOOL "" FORCE)
set(PCRE2_BUILD_PCRE2_16 OFF CACHE BOOL "" FORCE)
set(PCRE2_BUILD_PCRE2_32 OFF CACHE BOOL "" FORCE)
set(PCRE2_BUILD_PCRE2GREP OFF CACHE BOOL "" FORCE)
set(PCRE2_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(PCRE2_SHOW_REPORT OFF CACHE BOOL "" FORCE)
set(PCRE2_STATIC_RUNTIME ON CACHE BOOL "" FORCE)
set(PCRE2_SUPPORT_JIT ON CACHE BOOL "" FORCE)
add_subdirectory("${HBOX_PCRE2_SOURCE_DIR}" pcre2 EXCLUDE_FROM_ALL)

set(SKIP_INSTALL_ALL ON CACHE BOOL "" FORCE)
add_subdirectory("${HBOX_ZLIB_SOURCE_DIR}" zlib EXCLUDE_FROM_ALL)

add_library(hbox_bzip2 STATIC
  "${HBOX_BZIP2_SOURCE_DIR}/blocksort.c"
  "${HBOX_BZIP2_SOURCE_DIR}/huffman.c"
  "${HBOX_BZIP2_SOURCE_DIR}/crctable.c"
  "${HBOX_BZIP2_SOURCE_DIR}/randtable.c"
  "${HBOX_BZIP2_SOURCE_DIR}/compress.c"
  "${HBOX_BZIP2_SOURCE_DIR}/decompress.c"
  "${HBOX_BZIP2_SOURCE_DIR}/bzlib.c"
)
target_compile_definitions(hbox_bzip2 PRIVATE _CRT_SECURE_NO_WARNINGS)
target_include_directories(hbox_bzip2 PUBLIC "${HBOX_BZIP2_SOURCE_DIR}")

set(ZSTD_BUILD_CONTRIB OFF CACHE BOOL "" FORCE)
set(ZSTD_BUILD_PROGRAMS OFF CACHE BOOL "" FORCE)
set(ZSTD_BUILD_SHARED OFF CACHE BOOL "" FORCE)
set(ZSTD_BUILD_STATIC ON CACHE BOOL "" FORCE)
set(ZSTD_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(ZSTD_USE_STATIC_RUNTIME ON CACHE BOOL "" FORCE)
add_subdirectory("${HBOX_ZSTD_SOURCE_DIR}/build/cmake" zstd EXCLUDE_FROM_ALL)

set(BROTLI_BUNDLED_MODE ON CACHE BOOL "" FORCE)
add_subdirectory("${HBOX_BROTLI_SOURCE_DIR}" brotli EXCLUDE_FROM_ALL)

set(HBOX_VIIZ_SOURCE_DIR "${HBOX_UGREP_SOURCE_DIR}/lzma/C")
add_library(hbox_viiz STATIC
  "${HBOX_VIIZ_SOURCE_DIR}/viizip.c"
  "${HBOX_VIIZ_SOURCE_DIR}/7zAlloc.c"
  "${HBOX_VIIZ_SOURCE_DIR}/7zArcIn.c"
  "${HBOX_VIIZ_SOURCE_DIR}/7zBuf.c"
  "${HBOX_VIIZ_SOURCE_DIR}/7zBuf2.c"
  "${HBOX_VIIZ_SOURCE_DIR}/7zCrc.c"
  "${HBOX_VIIZ_SOURCE_DIR}/7zCrcOpt.c"
  "${HBOX_VIIZ_SOURCE_DIR}/7zDec.c"
  "${HBOX_VIIZ_SOURCE_DIR}/7zFile.c"
  "${HBOX_VIIZ_SOURCE_DIR}/7zStream.c"
  "${HBOX_VIIZ_SOURCE_DIR}/Bcj2.c"
  "${HBOX_VIIZ_SOURCE_DIR}/Bra.c"
  "${HBOX_VIIZ_SOURCE_DIR}/Bra86.c"
  "${HBOX_VIIZ_SOURCE_DIR}/BraIA64.c"
  "${HBOX_VIIZ_SOURCE_DIR}/CpuArch.c"
  "${HBOX_VIIZ_SOURCE_DIR}/Delta.c"
  "${HBOX_VIIZ_SOURCE_DIR}/Lzma2Dec.c"
  "${HBOX_VIIZ_SOURCE_DIR}/LzmaDec.c"
  "${HBOX_VIIZ_SOURCE_DIR}/Ppmd7.c"
  "${HBOX_VIIZ_SOURCE_DIR}/Ppmd7Dec.c"
)
target_compile_definitions(hbox_viiz PRIVATE
  Z7_PPMD_SUPPORT
  Z7_EXTRACT_ONLY
  NDEBUG
  _CRT_SECURE_NO_WARNINGS
)
target_include_directories(hbox_viiz PUBLIC "${HBOX_VIIZ_SOURCE_DIR}")

set(HBOX_REFLEX_SOURCES
  "${HBOX_UGREP_SOURCE_DIR}/lib/block_scripts.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/composer.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/convert.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/debug.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/error.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/input.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/language_scripts.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/letter_case.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/letter_scripts.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/matcher.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/pattern.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/posix.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/simd.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/unicode.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/lib/utf8.cpp"
)

add_library(hbox_reflex STATIC ${HBOX_REFLEX_SOURCES})
target_compile_definitions(hbox_reflex PRIVATE WITH_NO_CODEGEN)

add_executable(ugrep
  "${HBOX_UGREP_SOURCE_DIR}/src/ugrep.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/src/cnf.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/src/glob.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/src/output.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/src/query.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/src/screen.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/src/stats.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/src/vkey.cpp"
  "${HBOX_UGREP_SOURCE_DIR}/src/zopen.c"
)

add_library(hbox_ugrep_contract INTERFACE)
target_compile_definitions(hbox_ugrep_contract INTERFACE
  HAVE_LIBBROTLI
  HAVE_LIBBZ2
  HAVE_LIBZ
  HAVE_LIBZSTD
  HAVE_PCRE2
  NDEBUG
  PCRE2_STATIC
  WITH_COLOR
  WITH_NO_INDENT
  _CONSOLE
  _CRT_NONSTDC_NO_WARNINGS
  _CRT_SECURE_NO_WARNINGS
)
if(CMAKE_GENERATOR_PLATFORM STREQUAL "ARM64")
  target_compile_definitions(hbox_ugrep_contract INTERFACE HAVE_NEON)
else()
  target_compile_definitions(hbox_ugrep_contract INTERFACE HAVE_SSE2)
endif()
target_compile_features(hbox_ugrep_contract INTERFACE cxx_std_17)
# ugrep 固定源码是无 BOM UTF-8；中文 Windows 按 CP936 解析时会触发 C4819/C1070，并改写 UTF-8 字符串字面量。
target_compile_options(hbox_ugrep_contract INTERFACE
  /utf-8
  $<$<COMPILE_LANGUAGE:CXX>:/EHsc>
)
target_include_directories(hbox_ugrep_contract INTERFACE
  "${HBOX_UGREP_SOURCE_DIR}/include"
  "${HBOX_UGREP_SOURCE_DIR}/src"
  "${HBOX_VIIZ_SOURCE_DIR}"
)

target_link_libraries(hbox_reflex PRIVATE hbox_ugrep_contract pcre2-8-static)
target_link_libraries(ugrep PRIVATE
  hbox_ugrep_contract
  hbox_reflex
  hbox_viiz
  pcre2-8-static
  zlibstatic
  hbox_bzip2
  libzstd_static
  brotlienc
  brotlidec
  brotlicommon
)
target_link_options(ugrep PRIVATE /Brepro)
set_target_properties(ugrep PROPERTIES
  RUNTIME_OUTPUT_DIRECTORY "${HBOX_UGREP_OUTPUT_DIR}"
  RUNTIME_OUTPUT_DIRECTORY_RELEASE "${HBOX_UGREP_OUTPUT_DIR}"
)
