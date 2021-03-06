var assert = require('assert');
var should = require('should');
var server = require("../server");
var request = require('supertest');


// Promise Test: getZipFromLatLong
describe('getZipFromLatLong', function() {
   it('should return the ZIP code for Mountain View, CA', function() {
      return server.getZipFromLatLong(37.42159, -122.0837).should.eventually.equal("94043");
   });
   it('should return the ZIP code for Santa Monica, CA', function() {
      return server.getZipFromLatLong(34.010929, -118.4915).should.eventually.equal("90401");
   });
   it('should fail; return ZIP code for Santa Monica instead of Mtn View', function() {
      return server.getZipFromLatLong(37.42159, -122.0837).should.eventually.not.equal("90401");
   });
   it('test case with lat and long: 0, 0; should be zero', function() {
      return server.getZipFromLatLong(0, 0).should.eventually.equal("");
   });
});

// Promise Test: getLatAndLong
describe('getLatAndLong', function() {
   it('should return GPS info for JPG with GPS metadata', function() {
      return server.getLatAndLong("../uploads/IMG_1448.jpg").should.eventually.deepEqual({
         "latitude": 47.66025277777778,
         "longitude": -117.42530833333333
      });
   });
   it('should properly fail with wrong GPS info for JPG with GPS metadata', function() {
      return server.getLatAndLong("../uploads/IMG_9447.jpeg").should.eventually.not.equal({
         "latitude": 47.66025277777778,
         "longitude": -117.42530833333333
      });
   });
   it('should return no GPS info for JPG without GPS metadata', function() {
      return server.getLatAndLong("../uploads/george.jpg").should.be.rejectedWith(Error);
   });
   it('should return no GPS info for JPG without GPS metadata', function() {
      return server.getLatAndLong("../uploads/cover_linkedin.jpg").should.be.rejectedWith(Error);
   });
   it('should return no GPS info for PNG', function() {
      return server.getLatAndLong("../uploads/Careers in tech.jpg").should.be.rejectedWith(Error);
   });
   
});

// server test: verify that the server is running
describe('Verify the server is running', function() {
   it('should return JSON to verify server is running', function(done) {
      request(server.app)
         .get('/')
         .end((err, res) => {
            if (err) return done(err);
            //console.log(res.body);
            res.status.should.equal(200);
            res.body["msg"].should.equal("Express server running");
            done();
          });
   })
});


