const assert = require('chai').assert;
const expect = require('chai').expect;
const chai = require('chai')
const chaiHttp = require('chai-http');

const {DateTime} = require('luxon');
const date = require('../forum').get_date;

chai.use(chaiHttp);

function get_date_test() {
    return DateTime.local().toLocaleString(DateTime.DATETIME_SHORT);
}

describe('Date/Time Function', function(){
    it('app should return current date and time', function(){
        let result = date();
        assert.equal(result, get_date_test());
    });
});

describe('GET /', function () {
    it("should return homepage", function (done) {
        chai.request('https://polar-ocean-59620.herokuapp.com')
            .get('/')
            .end(function(err, res) {
                expect('Content-Type', "text/html; charset=utf-8");
                expect(res).to.have.status(200);
                done();
            });
    });
});

// OLD LOGIN TEST
// describe('Login', function () {
//     it('Should see homepage text "Message Board" (successful redirect)', function (done) {
//         chai.request('http://localhost:8080')
//             .post('/login')
//             .type('form')
//             .send({username: 'tester', password: 'test'})
//             .then(function (res) {
//                 var str = res.text;
//                 var page_text = /Message Board/i;
//                 var result = page_text.test(str);
//                 assert.equal(result, true);
//                 done()
//             });
//     })
// })

describe('Login', function () {
    it('Should redirect to main page', function (done) {
        chai.request('https://polar-ocean-59620.herokuapp.com')
            .post('/login')
            .type('form')
            .send({username: 'tester', password: 'test'})
            .then(function (res) {
                expect(res).to.redirectTo('https://polar-ocean-59620.herokuapp.com/')
                done();
            });
    });
});


describe('Invalid login', function () {
    it('Should reload page', function (done) {
        chai.request('https://polar-ocean-59620.herokuapp.com')
            .post('/login')
            .type('form')
            .send({username: '', password: ''})
            .end(function(err, res) {
                var url = /login/i;
                var result = url.test(res.redirects);
                assert.equal(result, true);
                done();
            });
    });
});

describe('Add post', function() {
    it('Should add post to database', function(done) {
        var agent = chai.request.agent('https://polar-ocean-59620.herokuapp.com')
        agent
            .post('/login')
            .type('form')
            .send({username: 'tester', password: 'test'})
            .then(function(res) {
                return agent
                    .post('/add_post')
                    .type('form')
                    .send({title: 'test title new', message: 'test message', category: 'Test'})
                    .then(function(res) {
                        var str = res.text;
                        var page_text = /test title new/i;
                        var result = page_text.test(str);
                        assert.equal(result, true);
                        done();
                    });
            });
        agent.close();
    });
});

describe('Edit reply', function() {
    it('Should successfully edit post (with matching random number)', function(done) {
        var agent = chai.request.agent('https://polar-ocean-59620.herokuapp.com')
        var random_number = Math.random().toString()
        agent
            .post('/login')
            .type('form')
            .send({username: 'tester', password: 'test'})
            .then(function(res) {
                return agent
                    .post('/edit_reply')
                    .type('form')
                    .send({reply_id: '5cdde948c82a5800173ea133', reply_username: 'tester', edit_reply_textarea: "edit successful! Test number: " + random_number})
                    .then(function(res) {
                        return agent
                            .get('/thread/5cdde936c82a5800173ea132')
                            .then(function(res) {
                                var str = res.text;
                                var patt = new RegExp(random_number)
                                var result = patt.test(str);
                                assert.equal(result, true);
                                done();
                            });
                    });
            });
        agent.close();
    });
});

describe('Post with category', function() {
    it('should add post with category Help', function(done) {
        var agent = chai.request.agent('https://polar-ocean-59620.herokuapp.com')
        
        agent
            .post('/login')
            .type('form')
            .send({username: 'tester', password: 'test'})
            .then(function(res) {
                return agent
                    .post('/add_post')
                    .type('form')
                    .send({title: 'category post test', message: 'test message', category: 'Help'})
                    .then(function(res) {
                        var str = res.text;
                        var page_text = /Meta/i;

                        var result = page_text.test(str);

                        assert.equal(result, true);
                        done();
                    });
            });
        agent.close();
    });
});

describe('Get category pages', function () {
    it('Should return forum Meta category', function (done) {
        chai.request('https://polar-ocean-59620.herokuapp.com')
            .get('/forum/Meta')
            .end(function(err, res) {
                expect('Content-Type', "text/html; charset=utf-8");
                expect(res).to.have.status(200);
                done()
            });
    });
});

describe('Update profile picture', function() {
    it('Should update user\'s profile picture', function(done) {
        var agent = chai.request.agent('https://polar-ocean-59620.herokuapp.com')

        agent
            .post('/login')
            .type('form')
            .send({username: 'tester', password: 'test'})
            .then(function(res) {
                return agent
                    .post('/update_img')
                    .type('form')
                    .send({image: 'https://i.imgur.com/aSr755J.jpg'})
                    .then(function(res) {
                        var str = res.text;
                        var page_text = /https:\/\/i.imgur.com\/aSr755J.jpg/i;
                        var result = page_text.test(str);
                        
                        assert.equal(result, true);
                        done();
                    });
            });
        agent.close();
    });
});

describe('Get profile pages', function () {
    it("Should return tester's profile page", function (done) {
        chai.request('https://polar-ocean-59620.herokuapp.com')
            .get('/user/tester')
            .end(function(err, res) {
                expect('Content-Type', "text/html; charset=utf-8");
                expect(res).to.have.status(200);
                done()
            });
    });
});
