import { AuditableEntityBase } from "../../base/auditable-entity-base.model";
import { DateTimeInfo } from "../../base/common.model";
import { NodeFull } from "../nodes/nodes.model";

export interface Route {
  routeId: string;
  userId: string;
  challengeId?: string;
  startTime: DateTimeInfo;
  endTime?: DateTimeInfo;
  totalDistance?: number;
  duration?: number;
  elevationGain?: number;
  nodeSequence?: string[];
  trackingPoints: TrackingPoint[];
  nodes?: NodeFull[];
}

export interface TrackingPoint extends AuditableEntityBase {
  lat: number;
  lng: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  bearing?: number;
  motionType?: 'walking' | 'running' | 'cycling' | 'driving';
  gpsSource?: 'phone' | 'watch' | 'external-GPS';
}
