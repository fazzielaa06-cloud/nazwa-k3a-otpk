export type ContainerSize = '20ft' | '40ft' | '45ft';
export type ContainerType = 'Dry' | 'Reefer' | 'Open Top' | 'Flat Rack' | 'Tank';
export type ContainerStatus = 'Import' | 'Export' | 'Transhipment' | 'Empty';
export type CustomsStatus = 'SPPB Cleared' | 'Red Line Inspection' | 'Yellow Line' | 'Hold' | 'Pending';

export interface YardLocation {
  block: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  bay: number; // 1-24
  row: number; // 1-6
  tier: number; // 1-5
}

export interface Container {
  id: string;
  containerNumber: string; // ISO 6346: 4 letters + 7 digits (e.g. MSKU1234567)
  size: ContainerSize;
  type: ContainerType;
  height: 'Standard (8.6ft)' | 'High Cube (9.6ft)';
  status: ContainerStatus;
  isoCode: string; // e.g. "22G1", "45R1", "42G1"
  weightGross: number; // in kg
  weightTare: number;
  weightNet: number;
  shippingLine: string;
  sealNumber: string;
  yardLocation: YardLocation;
  commodity: string;
  isDangerousGoods: boolean;
  imdgClass?: string;
  temperatureTarget?: number; // for reefer (°C)
  vesselId?: string;
  vesselName?: string;
  consignee: string;
  customsStatus: CustomsStatus;
  dwellDays: number;
  createdAt: string;
  updatedAt: string;
}

export type VesselStatus = 'Berthed' | 'Approaching' | 'Anchored' | 'Departed' | 'Operations Finished';
export type BerthSlot = 'Dermaga 01' | 'Dermaga 02' | 'Dermaga 03' | 'Dermaga 04' | 'Anchorage';

export interface Vessel {
  id: string;
  vesselName: string;
  callSign: string;
  imoNumber: string;
  flag: string;
  loa: number; // Length overall in meters
  beam: number;
  draft: number;
  berthSlot: BerthSlot;
  quayCranesAssigned: string[];
  eta: string;
  etd: string;
  ata?: string;
  atd?: string;
  status: VesselStatus;
  totalDischargeTEU: number;
  dischargedCount: number;
  totalLoadTEU: number;
  loadedCount: number;
  shippingAgent: string;
  bph: number; // Box Per Hour
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type GateTransactionType = 
  | 'GATE_IN_IMPORT'
  | 'GATE_IN_EXPORT'
  | 'GATE_OUT_IMPORT'
  | 'GATE_OUT_EMPTY'
  | 'GATE_OUT_EXPORT';

export interface GateTransaction {
  id: string;
  eirNumber: string; // EIR-20261028-0001
  type: GateTransactionType;
  containerNumber: string;
  truckNumber: string;
  driverName: string;
  driverPhone: string;
  driverLicense: string;
  emklCompany: string;
  doNumber?: string;
  sp2Number?: string;
  sealNumber: string;
  physicalInspection: 'Baik & Utuh' | 'Penyok Ringan' | 'Pintu Rusak' | 'Karat Parah' | 'Seal Rusak';
  weightGross: number;
  weightTruckTare: number;
  weightNetContainer: number;
  assignedYardLocation: string;
  gateLane: 'Gate 01 (Inbound)' | 'Gate 02 (Inbound)' | 'Gate 03 (Outbound)' | 'Gate 04 (Outbound)';
  status: 'Completed' | 'In Yard' | 'Processing' | 'Rejected';
  operatorName: string;
  timestamp: string;
}

export interface StevedoringJob {
  id: string;
  jobType: 'DISCHARGE' | 'LOAD' | 'SHIFTING';
  containerNumber: string;
  vesselName: string;
  quayCraneId: string;
  originLocation: string;
  destinationLocation: string;
  status: 'Queued' | 'In Progress' | 'Completed' | 'Aborted';
  equipmentUsed: 'Quay Crane' | 'RTG Crane' | 'Reach Stacker' | 'Terminal Tractor';
  operator: string;
  cycleTimeMinutes: number;
  completedAt?: string;
  createdAt: string;
}

export interface CustomerEMKL {
  id: string;
  code: string;
  name: string;
  npwp: string;
  pic: string;
  phone: string;
  email: string;
  address: string;
  creditStatus: 'Good' | 'Warning' | 'Blocked';
  activeShipments: number;
  createdAt: string;
}

export type UserRole = 'Super Admin' | 'Yard Planner' | 'Berth Controller' | 'Gate Operator';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  badgeNumber: string;
  terminalShift: string;
  avatarUrl: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'GATE_IN' | 'GATE_OUT' | 'BERTH_CHANGE' | 'EXPORT_DATA';
  module: 'CONTAINER' | 'VESSEL' | 'GATE' | 'STEVEDORING' | 'CUSTOMER' | 'AUTH';
  details: string;
}

export interface TerminalKPIs {
  totalContainers: number;
  totalTEU: number;
  yardCapacityTEU: number;
  yardOccupancyRate: number; // percentage
  activeVessels: number;
  vesselsInQueue: number;
  todayGateInCount: number;
  todayGateOutCount: number;
  avgDwellingDays: number;
  averageGMPH: number; // Gross moves per hour
}
