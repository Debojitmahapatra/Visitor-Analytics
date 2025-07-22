exports.validateVisitorEvent=(data)=> {
  const errors = [];

  if (!data.type || typeof data.type !== 'string') {
    errors.push('Missing or invalid "type"');
  }

  if (!data.page || typeof data.page !== 'string' || !data.page.startsWith('/')) {
    errors.push('Missing or invalid "page"');
  }

  if (!data.sessionId || typeof data.sessionId !== 'string') {
    errors.push('Missing or invalid "sessionId"');
  }

  if (!data.country || typeof data.country !== 'string') {
    errors.push('Missing or invalid "country"');
  }

  if (data.metadata) {
    if (typeof data.metadata !== 'object') {
      errors.push('"metadata" must be an object');
    } else {
      if (data.metadata.device && typeof data.metadata.device !== 'string') {
        errors.push('"metadata.device" must be a string');
      }
      if (data.metadata.referrer && typeof data.metadata.referrer !== 'string') {
        errors.push('"metadata.referrer" must be a string');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
