import {
  TrackingSettings,
  trackingSettingsToApiFormat,
} from '../../models/TrackingSettings';

describe('TrackingSettings', () => {
  describe('trackingSettingsToApiFormat', () => {
    it('should convert tracking settings with all fields to API format', () => {
      const tracking: TrackingSettings = {
        opens: false,
        clicks: true,
        unsubscribes: false,
        unsubscribeGroupId: 123,
      };

      const result = trackingSettingsToApiFormat(tracking);

      expect(result).toEqual({
        opens: false,
        clicks: true,
        unsubscribes: false,
        unsubscribe_group_id: 123,
      });
    });

    it('should use default values when fields are undefined', () => {
      const tracking: TrackingSettings = {};

      const result = trackingSettingsToApiFormat(tracking);

      expect(result).toEqual({
        opens: true,
        clicks: true,
        unsubscribes: true,
      });
    });

    it('should convert partial tracking settings', () => {
      const tracking: TrackingSettings = {
        opens: false,
        clicks: false,
      };

      const result = trackingSettingsToApiFormat(tracking);

      expect(result).toEqual({
        opens: false,
        clicks: false,
        unsubscribes: true, // default value
      });
    });

    it('should include unsubscribe group ID when provided', () => {
      const tracking: TrackingSettings = {
        unsubscribeGroupId: 456,
      };

      const result = trackingSettingsToApiFormat(tracking);

      expect(result).toEqual({
        opens: true,
        clicks: true,
        unsubscribes: true,
        unsubscribe_group_id: 456,
      });
    });

    it('should not include unsubscribe group ID when undefined', () => {
      const tracking: TrackingSettings = {
        opens: true,
        clicks: true,
        unsubscribes: true,
      };

      const result = trackingSettingsToApiFormat(tracking);

      expect(result).not.toHaveProperty('unsubscribe_group_id');
    });

    it('should handle zero as valid unsubscribe group ID', () => {
      const tracking: TrackingSettings = {
        unsubscribeGroupId: 0,
      };

      const result = trackingSettingsToApiFormat(tracking);

      expect(result).toEqual({
        opens: true,
        clicks: true,
        unsubscribes: true,
        unsubscribe_group_id: 0,
      });
    });
  });
});
