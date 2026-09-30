# AIRWISE — C++ Backend + HTML5/CSS3/JS Web Application

This folder provides the complete **C++, SQLite, HTML5, CSS3, and JavaScript** architecture for the AirWise application.

## 1. Tech Stack
- **Backend**: C++ (C++17/20) using `main.cpp`
- **Database**: SQL (SQLite3 `aqi_history.db`)
- **Frontend Presentation**: HTML5 (`templates/index.html`) & CSS3 (`static/css/style.css`)
- **Frontend Logic**: JavaScript ES6+ (`static/js/script.js`)

The user interface, circular gauge meter, interactive Leaflet map, authentication modals, and AI health advisory remain **100% identical** without modifying a single visual element.

---

## 2. Prerequisites
- A C++ compiler supporting C++17 (`g++`, `clang++`, or Visual Studio MSVC)
- SQLite3 development libraries (`libsqlite3-dev` on Linux/Ubuntu, or standard SQLite3 DLL/lib on Windows)
- CMake 3.14+ (optional, or compile directly with `g++`)

---

## 3. How to Build & Run with C++

### Using GCC / G++ (Linux / macOS / MinGW):
```bash
g++ -std=c++17 -O2 main.cpp -lsqlite3 -lpthread -o airwise_server
./airwise_server
```

### Using CMake:
```bash
mkdir build && cd build
cmake ..
cmake --build .
./airwise_server
```

---

## 4. How the Frontend Connects to C++
The frontend located in `templates/index.html` and `static/js/script.js` uses standard JavaScript `fetch()` calls to communicate with the C++ server:

- `GET /` -> Serves `templates/index.html`
- `GET /api/aqi/current?city=Bhubaneswar` -> Returns real-time CPCB AQI data
- `POST /api/advisory/generate` -> Computes personalized clinical recommendations
- `GET /api/aqi/stations` -> Returns stations sorted alphabetically A→Z
- `GET /api/notifications` -> Fetches SQLite user alert logs

All styling and UI layouts are preserved exactly as designed.
