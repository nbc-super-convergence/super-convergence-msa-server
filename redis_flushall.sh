#!/bin/bash

# Redis Cluster 노드 정보
NODES=("shd1495.store:6379" "shd1495.store:6380" "shd1495.store:6381" "shd1495.store:6382" "shd1495.store:6383" "shd1495.store:6384" "shd1495.store:6385")

# 각 노드에 대해 FLUSHALL 실행
for NODE in "${NODES[@]}"; do
  HOST=$(echo $NODE | cut -d':' -f1)
  PORT=$(echo $NODE | cut -d':' -f2)
  echo "Flushing $HOST:$PORT"
  redis-cli -h $HOST -p $PORT -a 'qwerty7897' FLUSHALL
done

echo "All nodes flushed."