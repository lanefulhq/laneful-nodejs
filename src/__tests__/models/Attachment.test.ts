import {
  Attachment,
  validateAttachment,
  attachmentToApiFormat,
} from '../../models/Attachment';

describe('Attachment', () => {
  describe('validateAttachment', () => {
    it('should validate attachment with fileName', () => {
      const attachment: Attachment = {
        contentType: 'application/pdf',
        fileName: 'document.pdf',
        content: 'base64content',
      };

      expect(() => validateAttachment(attachment)).not.toThrow();
    });

    it('should validate attachment with inlineId', () => {
      const attachment: Attachment = {
        contentType: 'image/png',
        inlineId: 'image1',
        content: 'base64imagedata',
      };

      expect(() => validateAttachment(attachment)).not.toThrow();
    });

    it('should validate attachment with both fileName and inlineId', () => {
      const attachment: Attachment = {
        contentType: 'image/jpeg',
        fileName: 'photo.jpg',
        inlineId: 'photo1',
        content: 'base64imagedata',
      };

      expect(() => validateAttachment(attachment)).not.toThrow();
    });

    it('should throw for missing contentType', () => {
      const attachment = {
        fileName: 'document.pdf',
        content: 'base64content',
      } as unknown as Attachment;

      expect(() => validateAttachment(attachment)).toThrow(
        'Attachment must have a valid contentType string'
      );
    });

    it('should throw for empty contentType', () => {
      const attachment: Attachment = {
        contentType: '',
        fileName: 'document.pdf',
        content: 'base64content',
      };

      expect(() => validateAttachment(attachment)).toThrow(
        'Attachment must have a valid contentType string'
      );
    });

    it('should throw for non-string contentType', () => {
      const attachment = {
        contentType: 123,
        fileName: 'document.pdf',
        content: 'base64content',
      } as unknown as Attachment;

      expect(() => validateAttachment(attachment)).toThrow(
        'Attachment must have a valid contentType string'
      );
    });

    it('should throw when both fileName and inlineId are missing', () => {
      const attachment: Attachment = {
        contentType: 'application/pdf',
        content: 'base64content',
      };

      expect(() => validateAttachment(attachment)).toThrow(
        'Either fileName or inlineId is required for attachments'
      );
    });
  });

  describe('attachmentToApiFormat', () => {
    it('should convert attachment with all fields to API format', () => {
      const attachment: Attachment = {
        contentType: 'application/pdf',
        fileName: 'document.pdf',
        content: 'base64content',
        inlineId: 'doc1',
      };

      const result = attachmentToApiFormat(attachment);

      expect(result).toEqual({
        content_type: 'application/pdf',
        file_name: 'document.pdf',
        content: 'base64content',
        inline_id: 'doc1',
      });
    });

    it('should convert attachment with only required fields', () => {
      const attachment: Attachment = {
        contentType: 'text/plain',
        fileName: 'readme.txt',
      };

      const result = attachmentToApiFormat(attachment);

      expect(result).toEqual({
        content_type: 'text/plain',
        file_name: 'readme.txt',
      });
    });

    it('should convert inline attachment without fileName', () => {
      const attachment: Attachment = {
        contentType: 'image/png',
        content: 'base64imagedata',
        inlineId: 'logo',
      };

      const result = attachmentToApiFormat(attachment);

      expect(result).toEqual({
        content_type: 'image/png',
        content: 'base64imagedata',
        inline_id: 'logo',
      });
    });

    it('should not include undefined fields in API format', () => {
      const attachment: Attachment = {
        contentType: 'application/json',
        fileName: 'data.json',
      };

      const result = attachmentToApiFormat(attachment);

      expect(result).not.toHaveProperty('content');
      expect(result).not.toHaveProperty('inline_id');
    });
  });
});
