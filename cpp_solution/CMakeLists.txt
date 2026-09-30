cmake_minimum_required(VERSION 3.14)
project(AirWiseServer LANGUAGES CXX C)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find SQLite3
find_package(SQLite3 REQUIRED)
find_package(Threads REQUIRED)

add_executable(airwise_server main.cpp)

target_link_libraries(airwise_server PRIVATE
    SQLite::SQLite3
    Threads::Threads
)
