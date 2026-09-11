/**
 * Email tracking settings.
 */
export interface TrackingSettings {
  /** Track email opens */
  opens?: boolean;
  /** Track link clicks */
  clicks?: boolean;
  /** Track unsubscribes */
  unsubscribes?: boolean;
  /** Unsubscribe group ID */
  unsubscribeGroupId?: number;
  /** Unsubscribe group name (ignored if unsubscribeGroupId is set) */
  unsubscribeGroupName?: string;
}

/**
 * Converts TrackingSettings to API request format.
 */
export function trackingSettingsToApiFormat(
  tracking: TrackingSettings
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    opens: tracking.opens ?? true,
    clicks: tracking.clicks ?? true,
    unsubscribes: tracking.unsubscribes ?? true,
  };

  if (tracking.unsubscribeGroupId !== undefined) {
    result.unsubscribe_group_id = tracking.unsubscribeGroupId;
  }

  if (tracking.unsubscribeGroupName !== undefined) {
    result.unsubscribe_group_name = tracking.unsubscribeGroupName;
  }

  return result;
}
