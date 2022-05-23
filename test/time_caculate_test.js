const { assert } = require('chai');
const { timeStringToMinutes, getDefaultLeaveHours } = require('../util/time_transformer');

describe('test trans string to minutes', () => {
  const str = '10:00:00';
  it('should be quual', () => {
    assert.equal(timeStringToMinutes(str), 600);
  });
  it('should not be quual', () => {
    assert.notEqual(timeStringToMinutes(str), 660);
  });
});

describe('test get default leave hours', () => {
  const restStart = '12:00:00';
  const restEnd = '13:00:00';
  describe('both start & end before rest', () => {
    const start = '09:00:00';
    const end = '11:00:00';
    it('should be quual', () => {
      assert.equal(getDefaultLeaveHours(start, end, restStart, restEnd), 2);
    });
  });
  describe('start before rest, end in rest', () => {
    const start = '09:00:00';
    const end = '12:30:00';
    it('should be quual', () => {
      assert.equal(getDefaultLeaveHours(start, end, restStart, restEnd), 3);
    });
  });
  describe('start in rest, end after rest', () => {
    const start = '12:45:00';
    const end = '15:00:00';
    it('should be quual', () => {
      assert.equal(getDefaultLeaveHours(start, end, restStart, restEnd), 2);
    });
  });
  describe('both start & end in rest', () => {
    const start = '12:00:00';
    const end = '13:00:00';
    it('should be quual', () => {
      assert.equal(getDefaultLeaveHours(start, end, restStart, restEnd), 0);
    });
  });
  describe('both start & end after rest', () => {
    const start = '14:00:00';
    const end = '17:00:00';
    it('should be quual', () => {
      assert.equal(getDefaultLeaveHours(start, end, restStart, restEnd), 3);
    });
  });
  describe('start before rest, end after rest', () => {
    const start = '09:00:00';
    const end = '18:00:00';
    it('should be quual', () => {
      assert.equal(getDefaultLeaveHours(start, end, restStart, restEnd), 8);
    });
  });
});
