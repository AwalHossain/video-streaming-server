import os from 'os';
import { logger } from './logger';

export interface SystemResources {
  cpuUsage: number; // percentage (0-100)
  memoryUsage: number; // percentage (0-100)
  availableCpuCount: number; // number of available CPU cores
  availableMemoryMB: number; // available memory in MB
  totalMemoryMB: number; // total memory in MB
}

export class ResourceMonitor {
  private static instance: ResourceMonitor;
  private cpuUsageHistory: number[] = [];
  private lastCpuInfo: { idle: number; total: number } | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private resources: SystemResources = {
    cpuUsage: 0,
    memoryUsage: 0,
    availableCpuCount: os.cpus().length,
    availableMemoryMB: 0,
    totalMemoryMB: os.totalmem() / (1024 * 1024)
  };
  
  private constructor() {
    // Initialize CPU and memory readings
    this.updateResourceInfo();
  }

  /**
   * Get the singleton instance of ResourceMonitor
   */
  public static getInstance(): ResourceMonitor {
    if (!ResourceMonitor.instance) {
      ResourceMonitor.instance = new ResourceMonitor();
    }
    return ResourceMonitor.instance;
  }

  /**
   * Start monitoring resources at the specified interval
   * @param intervalMs Time between updates in milliseconds
   */
  public startMonitoring(intervalMs: number = 5000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateResourceInfo();
    }, intervalMs);

    logger.info(`Resource monitoring started with ${intervalMs}ms interval`);
  }

  /**
   * Stop monitoring resources
   */
  public stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.info('Resource monitoring stopped');
    }
  }

  /**
   * Get the current system resource information
   */
  public getResources(): SystemResources {
    return { ...this.resources };
  }

  /**
   * Update CPU and memory information
   */
  private updateResourceInfo(): void {
    // Update memory info
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    this.resources.memoryUsage = Math.round((usedMemory / totalMemory) * 100);
    this.resources.availableMemoryMB = Math.round(freeMemory / (1024 * 1024));
    
    // Update CPU info
    const cpuInfo = this.getCpuInfo();
    if (cpuInfo !== null) {
      this.resources.cpuUsage = cpuInfo;
      
      // Store the last 3 readings to smooth out fluctuations
      this.cpuUsageHistory.push(cpuInfo);
      if (this.cpuUsageHistory.length > 3) {
        this.cpuUsageHistory.shift();
      }
      
      // Average the CPU usage readings
      const avgCpuUsage = this.cpuUsageHistory.reduce((a, b) => a + b, 0) / this.cpuUsageHistory.length;
      this.resources.cpuUsage = Math.round(avgCpuUsage);
    }
  }

  /**
   * Calculate CPU usage percentage
   * This uses a differential approach between two readings for more accurate results
   */
  private getCpuInfo(): number | null {
    const cpus = os.cpus();
    
    let idleTime = 0;
    let totalTime = 0;

    for (const cpu of cpus) {
      idleTime += cpu.times.idle;
      totalTime += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
    }

    // First run - just store initial values and return null
    if (this.lastCpuInfo === null) {
      this.lastCpuInfo = { idle: idleTime, total: totalTime };
      return null;
    }

    // Calculate deltas
    const idleDelta = idleTime - this.lastCpuInfo.idle;
    const totalDelta = totalTime - this.lastCpuInfo.total;
    
    // Update last reading
    this.lastCpuInfo = { idle: idleTime, total: totalTime };
    
    // Calculate usage percentage
    const usagePercent = 100 - Math.round(idleDelta * 100 / totalDelta);
    return usagePercent;
  }
}

// Export a singleton instance
export const resourceMonitor = ResourceMonitor.getInstance();

// Calculate optimal concurrency based on system resources
export function calculateOptimalConcurrency(minConcurrency = 1, maxConcurrency = 6): number {
  const resources = resourceMonitor.getResources();
  
  // Get available CPU cores (with some headroom)
  const availableCores = resources.availableCpuCount;
  
  // Consider both CPU and memory load
  const cpuFactor = (100 - resources.cpuUsage) / 100;
  const memoryFactor = (100 - resources.memoryUsage) / 100;
  
  // Calculate weighted concurrency (giving more weight to CPU)
  const weightedFactor = cpuFactor * 0.7 + memoryFactor * 0.3;
  
  // Calculate optimal concurrency
  let concurrency = Math.max(1, Math.floor(availableCores * weightedFactor));
  
  // Ensure we stay within bounds
  concurrency = Math.max(minConcurrency, Math.min(maxConcurrency, concurrency));
  
  return concurrency;
}