# EM-ONE — Humanoid Fleet Control Center

An interactive simulation of a **control center orchestrating a team of humanoid robots on an automotive assembly line**. It's the first step towards a Claude Code control center for multi-robot teams. The name is a nod to Push Singh's EM-ONE.

Open `index.html` in any browser. It's a single file with no build step and no dependencies.

## What it simulates

- **6 stations:** body welding → paint → powertrain → wiring & trim → final assembly → quality gate. Cars move down the line once a station's tasks are done.
- **12 humanoid robots.** Each has its own skills (weld, paint, heavy lift, wiring, fastening, inspection) and skill levels, a draining battery, and wear that makes faults more likely.
- **Shared resources:** a parts warehouse (panels, engines, harnesses, dashboards, wheels, seats) that restocks over time, a 4-bay charging dock and a 2-bay maintenance area.
- **Disruptions you can inject:** a robot fault, a parts shortage, a person entering a work zone (20 s protective stop that freezes the robots inside), and a rush order.

## Three orchestration strategies

| Strategy | How it decides |
|---|---|
| **Fixed stations** | Each robot only works at its home station. Charging and repairs happen only after something goes wrong. |
| **Greedy nearest** | The closest idle robot with the right skill takes the oldest task. Ignores skill level, battery and wear. |
| **AI control center** | Contract-net auction: robots bid on each task using travel time, skill level, battery and wear. Bottleneck and rush tasks go first. Charging is planned, and a robot on an opportunistic top-up can be pulled off the charger. Robots get preventive maintenance before they fail. No robot is sent to wait for parts that are out of stock, and no work is planned inside a safety zone. |

Benchmark: 60 simulated minutes, average of 3 seeds, the same scripted disruptions in every run, 1 random fault per robot-hour:

```
Strategy              Cars/h   Util  Cycle(s)  Faults  BattAbort
Fixed stations          43.7    33%       399    10.0       11.7
Greedy nearest          49.0    42%       329    13.7       27.3
AI control center       60.7    48%       277     7.3        0.0
```

Reproduce it without a browser:

```bash
node bench/benchmark.js            # fault rate 1/robot-hour, 60 minutes
node bench/benchmark.js 3 120      # fault rate 3, 120 minutes
```

The page also has a **Run benchmark** button, a live control-center console that logs every assignment with its bid, and a robot inspector (click any robot).

> All figures come from this simulation's own model. They are not measurements from a real plant.

## Simplifications

- Robots walk in straight lines and don't avoid each other. A robot whose path crosses a safety zone waits instead of going around it.
- Task times, battery drain and fault rates are illustrative parameters, set at the top of the `core` script in `index.html`.

## Roadmap: a real Claude Code control center

1. **Fleet layer as an MCP server:** expose robot and cell state and commands as tools. In a real plant this wraps the fleet manager, ROS 2, VDA 5050 (mobile robots) or OPC UA (line PLCs).
2. **Deterministic fast loop:** the task auction and charging rules stay in ordinary code that runs in milliseconds.
3. **Claude as supervisor:** handles exceptions (re-sequencing around shortages, re-planning after faults, inserting rush orders) and explains each decision to the shift lead. Subagents can each own a cell.
4. **Safety stays in hardware:** protective stops come from safety PLCs and robot controllers. The AI is told about them and plans around them, but never triggers or overrides them.

## License

MIT © Subhendra Basu (Bosons)
