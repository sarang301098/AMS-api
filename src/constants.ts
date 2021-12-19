export enum Token {
  ACCESS = 'access_token',
  REFRESH = 'refresh_token',
}

export enum Media {
  USER = 'user',
  COMPANY = 'company',
  APK = 'APK',
  FACTORY = 'factory',
}

/**
 * User type
 *
 * This enum define all user type available in the system.
 *
 * Super admin - AMS user - All access (All factory)
 * Admin - Owner of company - All access of his/her factory
 * Manager - Handle one or more factory - All access in assigned factory
 * Worker - Handle multiple ckms in generraly one or more factory - Provided access in assigned factory
 * Device - Device user - User create for device will have only one device access
 * Installer - User who install ckms in factory - Access (TBD)
 * Classifier - User who manually classify lables - Has access around frames and labels
 */
export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  WORKER = 'worker',
  DEVICE = 'device',
  INSTALLER = 'installer',
  CLASSIFIER = 'classifier',
  ML_MODEL = 'ml_model',
  DISTRIBUTOR = 'distributor',
  DEVELOPER = 'developer',
  USER = 'user',
}

export enum RequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

/**
 * Permission Type
 * Supervisor - read/create/update
 * manager - create/update
 * worker - read
 */

// export enum PermissionType {
//   Supervisor = 'supervisor',
//   Manager = 'manager',
//   Worker = 'worker',
// }

/**
 * Permission Types (NEW)
 */
export enum PermissionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

// as assumptions.
export enum StatusType {
  ON = 0,
  OFF = 1,
  STOP = 2,
  RUNNING = 3,
}

export enum LightType {
  IR = 'IR',
  UV = 'UV',
  VIS = 'VIS',
}

export enum LightPosition {
  TOP = 'TOP',
  FRONT = 'FRONT',
  BACK = 'BACK',
}

export enum CameraBarView {
  FRONT = 'FRONT',
  BACK = 'BACK',
}

// label value for no defects
export const NO_DEFECT = 'NoDefect';
export const EDGES = ['Edge', 'Right', 'Left'];
export const DEFECT_LABEL = 'Defect';

// stop motive type
export const DEFECT = 'defect';

// invalid status type
export const INVALID_STATUS_TYPE = 'INVALID';

export enum CurrentEquipmentTypes {
  SMX1 = 'SMX1',
  P19 = 'P19',
  BAR = 'Bar',
  TABLET = 'Tablet',
  AP = 'AP',
  XAVIER = 'Xavier',
  FINIS = 'Finis',
  MASTER_MODULE = 'Master-Module',
  GOOGLE_CORAL = 'Google-Coral',
  APEX = 'APEX',
  RPI0 = 'RPI0',
  RPI = 'RPI',
  LIGHT_BAR = 'Light-Bar',
  HEAVY_BAR = 'Heavy-Bar',
  LIGHT_MODULE = 'Light-Module',
  BREVIS_LUMEN = 'Brevis-Lumen',
  HEAVY_MODULE = 'Heavy-Module',
  DATUM = 'Datum',
  CAMERA = 'Camera',
  MAGNUS_LUMEN = 'Magnus-Lumen',
  AWS_MOF = 'AWS-MoF',
  AWS_MOR = 'AWS-MoR',
  AWS_KERNEL = 'AWS-Kernel',
}

// cache time
export const cacheTime = {
  DEFECTS: 1000 * 60 * 10,
  DEFECTS_PER_SHIFT: 1000 * 60 * 10,
  DEFECTS_BY_TYPE: 1000 * 60 * 10,
  DEFECTIVE_ROLLS_COUNT: 1000 * 60 * 10,
  INDIVIDUAL_MACHINE_STATUS: 1000 * 60 * 10,
  PRODUCTION_ROTATIONS: 1000 * 60 * 10,
  DASHBOARD_STATISTIC: 1,
};

export enum DOWNLOAD_TYPE {
  DIRECT = 'direct',
  INDIRECT = 'indirect',
}

export const FRAME_REQUEST_COUNT = 10;
export const SINGULAR_DEFECTS_FRAME_COUNT = 15;

export type AddMongoDocType<T, U> = T & { mongoDoc?: U };
export const ML_MODEL_DEVICE_KEY_LENGTH = 32;

export const DEFAULT_SHIFT_START_TIME = {
  MORNING: 6,
  AFTERNOON: 14,
  NIGHT: 22,
};

export const DEFECTS_FOR_REPORT_AND_GRAPH = ['point', 'horizontal', 'vertical', 'oil'];

export enum HumanVerification {
  OK = 'ok',
  BAD = 'bad',
}

export enum StopParameter {
  ROLL = 'roll',
  CONTEXTUAL = 'contextual',
}

export enum StopState {
  OK = 'ok',
  CABLE_DISCONNECTED = 'cable_disconnected',
  FINNIS_OFF = 'finnis_off',
}

export enum ProductionPerformance {
  ROTATION = 'rotations',
  METERS = 'meters',
}

export enum PointDefectNames {
  CLASSIFICATION = 'punctual',
  DEFECT = 'point',
}

export enum operators {
  eq = '=',
  ne = '!=',
  lt = '<',
  le = '<=',
  gt = '>',
  ge = '>=',
}
export enum TemplateLanguage {
  EN = 'english',
  PT = 'portuguese',
  IT = 'italian',
  TR = 'turkish',
}
export const DefaultTimezoneForSavingsReport = 'Etc/GMT';

export const MaxMachinesForXavier = 5;

export const DefaultEquipmentId = 4006;

// In minutes
export const minStopDuration = 15;

export enum AggerateFunctionOptionsForTimeSeriesData {
  COUNT = 'count',
  SUM = 'sum',
  AVERAGE = 'avg',
}

export const CkmStopDurationViewNameInDB = 'ckm_stop_durations_view';

// Vertical Field Of View = 0.22 meters
export const vfov = 0.22;

export enum TimeFormat {
  '12H' = '12h',
  '24H' = '24h',
}

export enum UnitPreferance {
  RPM = 'rpm',
  METERS = 'meters',
}

export enum EmailFrequency {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export const OCCURENCE = 'Occurrences';

export const levelOfDefectType: Record<string, number> = {
  horizontal: 0,
  vertical: 1,
  point: 2,
  oil: 3,
};

export const PossibleDefectLabelsForLabelTree = [
  'NoDefect',
  'Horizontal',
  'Vertical',
  'Point',
  'Oil',
];
