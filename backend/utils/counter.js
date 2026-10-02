const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "complaintId"
  seq: { type: Number, default: 1000 },
});

const Counter = mongoose.model("Counter", counterSchema);

/**
 * Atomically returns the next number in a named sequence, creating it
 * (starting at 1001) the first time it's used. Using this instead of
 * Math.random() (like the original frontend mock did) guarantees complaint
 * and log IDs never collide, even under concurrent requests.
 *
 * To make a sequence start higher (e.g. to continue after seeded demo
 * data), call `seedSequence(name, value)` once before first use.
 */
async function getNextSequence(name) {
  const result = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
}

/**
 * Sets a sequence's current value directly (used by the seed script so new
 * complaints continue after the highest seeded demo complaint ID).
 */
async function seedSequence(name, value) {
  await Counter.findByIdAndUpdate(name, { seq: value }, { upsert: true });
}

module.exports = { Counter, getNextSequence, seedSequence };
