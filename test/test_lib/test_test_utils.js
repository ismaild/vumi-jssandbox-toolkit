var assert = require("assert");
var test_utils = require("../../lib/test_utils");
var vumigo = require("../../lib");

var DummyApi = vumigo.dummy_api.DummyApi;
var InteractionMachine = vumigo.state_machine.InteractionMachine;
var StateCreator = vumigo.state_machine.StateCreator;
var FreeText = vumigo.states.FreeText;
var EndState = vumigo.states.EndState;


function TestStateCreator() {
    var self = this;
    StateCreator.call(self, "intro");

    self.add_state(new FreeText(
        "intro", "end_state",
        "Type something:"
    ));
    self.add_state(new EndState(
        "end_state", "Goodbye!"
    ));
}


function mk_app() {
    var api = new DummyApi();
    var states = new TestStateCreator();
    var im = new InteractionMachine(api, states);
    im.attach();
    return api;
}


describe("ImTester.check_state", function() {
    var api = mk_app();
    var tester = new test_utils.ImTester(api);

    function mk_opts(extra_opts) {
        var opts = {
            user: {},
            content: null,
            next_state: "intro",
            response: "Type something:",
        };
        for (var k in extra_opts) {
            opts[k] = extra_opts[k];
        }
        return opts;
    }

    function succeed_with(good_opts) {
        var opts = mk_opts(good_opts);
        tester.check_state(opts);
    }

    function fail_with(bad_opts) {
        var opts = mk_opts(bad_opts);
        assert.throws(function () {tester.check_state(opts);},
                      assert.AssertionError);
    }

    it("should pass on correct next_state and response", function() {
        succeed_with({});
    });

    it("should fail on incorrect next_state", function() {
        fail_with({next_state: "unknown"});
    });

    it("should fail on incorrect response", function() {
        fail_with({response: "Type something else:"});
    });

    it("should fail if response is too long", function() {
        fail_with({max_content_length: 2});
    });
});


describe("ImTester.check_close", function() {
    var api = mk_app();
    var tester = new test_utils.ImTester(api);

    function mk_opts(extra_opts) {
        var opts = {
            user: {},
            next_state: "intro",
        };
        for (var k in extra_opts) {
            opts[k] = extra_opts[k];
        }
        return opts;
    }

    function succeed_with(good_opts) {
        var opts = mk_opts(good_opts);
        tester.check_close(opts);
    }

    function fail_with(bad_opts) {
        var opts = mk_opts(bad_opts);
        assert.throws(function () {tester.check_close(opts);},
                      assert.AssertionError);
    }

    it("should pass on correct next_state", function() {
        succeed_with({});
    });

    it("should fail on incorrect next_state", function() {
        fail_with({next_state: "unknown"});
    });
});
