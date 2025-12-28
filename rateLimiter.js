const rateLimiter = new Map();

function checkCooldown(userId, command, cooldownSeconds) {
  const key = `${userId}-${command}`;
  const now = Date.now();
  const lastUsed = rateLimiter.get(key);

  if (lastUsed && now - lastUsed < cooldownSeconds * 1000) {
    return false;
  }

  rateLimiter.set(key, now);
  return true;
}

module.exports = { checkCooldown };
