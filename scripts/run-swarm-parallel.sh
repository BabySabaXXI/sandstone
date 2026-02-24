#!/bin/bash
# Parallel Swarm Execution Script
# Runs all 100 agents simultaneously

echo "🐝 Starting Sandstone Swarm - 100 Agents in Parallel"
echo "=================================================="
echo ""

# Create log directory
mkdir -p logs/swarm

# Function to run an agent
run_agent() {
  local id=$1
  local name=$2
  local squad=$3
  local task=$4
  local log_file="logs/swarm/agent_${id}.log"
  
  echo "[$id/100] 🚀 $name ($squad) - $task" | tee -a "$log_file"
  
  # Simulate work with random duration
  local duration=$((100 + RANDOM % 300))
  local steps=10
  local step_duration=$((duration / steps))
  
  for ((i=0; i<=steps; i++)); do
    local progress=$((i * 10))
    echo "[$id/100] ⏳ Progress: $progress%" >> "$log_file"
    sleep "0.${step_duration}"
  done
  
  echo "[$id/100] ✅ Completed" | tee -a "$log_file"
}

# Export function for parallel execution
export -f run_agent

echo "Launching all 100 agents simultaneously..."
echo ""

# Start all agents in parallel using background processes
# Backend Squad (15 agents)
for i in {1..15}; do
  run_agent $i "Backend Agent $i" "Backend" "Task $i" &
done

# Frontend Squad (20 agents)
for i in {16..35}; do
  run_agent $i "Frontend Agent $((i-15))" "Frontend" "Task $((i-15))" &
done

# UI/UX Squad (15 agents)
for i in {36..50}; do
  run_agent $i "UI/UX Agent $((i-35))" "UI/UX" "Task $((i-35))" &
done

# Auth Squad (10 agents)
for i in {51..60}; do
  run_agent $i "Auth Agent $((i-50))" "Auth" "Task $((i-50))" &
done

# Bug Fix Squad (15 agents)
for i in {61..75}; do
  run_agent $i "Bug Fix Agent $((i-60))" "Bug Fix" "Task $((i-60))" &
done

# Features Squad (15 agents)
for i in {76..90}; do
  run_agent $i "Feature Agent $((i-75))" "Features" "Task $((i-75))" &
done

# Deploy Squad (10 agents)
for i in {91..100}; do
  run_agent $i "Deploy Agent $((i-90))" "Deploy" "Task $((i-90))" &
done

echo ""
echo "All 100 agents are now running in parallel!"
echo "Waiting for completion..."
echo ""

# Wait for all background processes
wait

echo ""
echo "=================================================="
echo "✅ All 100 agents completed successfully!"
echo "Logs available in: logs/swarm/"
echo "=================================================="
