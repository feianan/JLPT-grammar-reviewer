// Shared memory state management with cycle system
const MemoryState = {
  // Load memory cycles from localStorage
  // Format: { id: cycle_number }
  load() {
    if (!localStorage.getItem("n2mem_v3_reset")) {
      localStorage.removeItem("n2mem_v3");
      localStorage.setItem("n2mem_v3_reset", "1");
    }
    const data = localStorage.getItem("n2mem_v3");
    return data ? JSON.parse(data) : {};
  },

  // Save memory cycles to localStorage
  save(cycles) {
    localStorage.setItem("n2mem_v3", JSON.stringify(cycles));
  },

  // Get cycle for a grammar item (0 = not memorized)
  getCycle(id, cycles) {
    return cycles[id] || 0;
  },

  // Increment cycle (memorize)
  incrementCycle(id, cycles) {
    const newCycles = { ...cycles };
    newCycles[id] = (newCycles[id] || 0) + 1;
    return newCycles;
  },

  // Decrement cycle (forget)
  decrementCycle(id, cycles) {
    const newCycles = { ...cycles };
    const current = newCycles[id] || 0;
    if (current > 0) {
      newCycles[id] = current - 1;
      if (newCycles[id] === 0) {
        delete newCycles[id];
      }
    }
    return newCycles;
  },

  // Get total memorized count (cycle > 0)
  getMemorizedCount(cycles) {
    return Object.keys(cycles).filter((id) => cycles[id] > 0).length;
  },

  // Get lowest cycle number in the system
  getLowestCycle(cycles) {
    const allCycles = Object.values(cycles);
    if (allCycles.length === 0) return 0;
    return Math.min(...allCycles);
  },

  // Get items at lowest cycle for flashcard
  getLowestCycleItems(allItems, cycles) {
    const lowestCycle = this.getLowestCycle(cycles);
    const itemsWithCycle0 = allItems.filter(
      (g) => !cycles[g.id] || cycles[g.id] === 0,
    );

    if (itemsWithCycle0.length > 0) {
      return itemsWithCycle0;
    }

    return allItems.filter((g) => cycles[g.id] === lowestCycle);
  },

  // Calculate progress percentage
  getProgress(cycles, totalItems) {
    const memorizedCount = this.getMemorizedCount(cycles);
    return totalItems ? Math.round((memorizedCount / totalItems) * 100) : 0;
  },

  // Get current lowest cycle and its completion count
  // Returns { cycle: number, remaining: number, total: number }
  getLowestCycleCompletion(allItems, cycles) {
    const total = allItems.length;

    // Check if there are any cycle 0 items (not memorized yet)
    const cycle0Items = allItems.filter(
      (g) => !cycles[g.id] || cycles[g.id] === 0,
    ).length;

    // If there are cycle 0 items, lowest cycle is 0; otherwise get min of stored cycles
    const lowestCycle = cycle0Items > 0 ? 0 : this.getLowestCycle(cycles);

    // Count items that are exactly at the lowest cycle (still need to study)
    const remaining = allItems.filter((g) => {
      const itemCycle = this.getCycle(g.id, cycles);
      return itemCycle === lowestCycle;
    }).length;

    return {
      cycle: lowestCycle,
      remaining,
      total,
    };
  },
};
