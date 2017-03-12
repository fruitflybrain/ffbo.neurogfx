 // the URL of the WAMP Router (Crossbar.io)
 //

var client_session;

var wsuri;
if (document.location.origin == "file://") {
   wsuri = "wss://127.0.0.1:9090/ws";

} else {
   wsuri = (document.location.protocol === "http:" ? "ws:" : "wss:") + "//" +
               document.location.host + "/ws";
}

var connection;
var login_succ = false;

function populate_server_lists(directory){
    var valid_server_type = ['na', 'nk'];
    for (var type in directory){
        if (valid_server_type.indexOf(type) > -1) {
            select = document.getElementById(type+'_servers');
            select.innerHTML = "";

            servers = directory[type];

            for (var id in servers) {
                var opt = document.createElement('option');
                opt.value = id;
                opt.innerHTML = servers[id]['name'];
                select.appendChild(opt);
            }
        }
    }
}
function showFeedback(message){
    select = document.getElementById('feedback');
    select.innerHTML = "<p>" + message + "</p>";
}
function construct_task(session, comp_list){
    var msg = {}
    msg['user'] =  session.id;
    msg['servers'] = {};
    msg['circuit'] = comp_list;
    var nk_servers = document.getElementById("nk_servers");

    try {
        msg['servers']['nk'] = nk_servers.options[nk_servers.selectedIndex].value;
    }
    catch(err) {
        console.log("nk server not valid");
        return;
    }

    return msg
}

function start_connection(authid, key){
    // the WAMP connection to the Router
    //
    function onchallenge (session, method, extra) {
	if (method === "wampcra") {
	    salted_key = autobahn.auth_cra.derive_key(key,extra.salt, extra.iterations, extra.keylen)
        if(key=="guestpass" && authid=="guest"){
                salted_key = "Y/w6jYBIOLM48hEKn9zRLx9gZCYwwrFW7K/ELtWzVT8=";
        }
	    return autobahn.auth_cra.sign(salted_key, extra.challenge);
	}
    }
    connection = new autobahn.Connection({
	url: wsuri,
	realm: "realm1",
	authmethods: ["wampcra"],
	authid: authid,
	onchallenge: onchallenge
    });

    connection.onopen = function(session, details) {

	console.log("Connected to FFBO");
	client_session = session;
	user = session.id;
	username = details.authid;
    login_succ = true;



    function on_server_update (args) {
      var directory = args[0];
      console.log("on_server_update() event received with directory: " + directory);
      populate_server_lists(directory)
   }

   session.subscribe('ffbo.server.update', on_server_update).then(
      function (sub) {
         console.log('subscribed to server update');
      },
      function (err) {
         console.log('failed to subscribe to server update', err);
      }
   );

   // SUBSCRIBE to a dynamic ui   updates from the processor
   //
   function on_ui_update (args) {
      var info = args[0];
      console.log("on_ui_update() event received with: " + info);
       showFeedback(info['success']['message'])
   }

   session.subscribe('ffbo.ui.update.'+session.id, on_ui_update).then(
      function (sub) {
         console.log('subscribed to ui update on ffbo.ui.update.'+session.id);
      },
      function (err) {
         console.log('failed to subscribe to ui update', err);
      }
   );

   session.call('ffbo.processor.server_information').then(
       function (res) {
           console.log("on_server_update() event received with directory: " + res);
           populate_server_lists(res)
       },
       function (err) {
           console.log("server retrieval error:", err);
       }
   );
   
    function receive_partial_result (args, kwargs, details) {
        var d = autobahn.when.defer();
        setTimeout(function() {
        d.resolve(args);
        }, visualize_result(args));
        return d.promise;
}
    
    function visualize_result (args) {
        console.log("Result Partially Received");
        var msg = args[0];
        console.log("partial data received with: " + msg);
        //clearInterval(ex_notification);
        Notify("Visualizing result.")
        run_visualization(msg);
        console.log("returning from receive partial");
        return True
    }
    
    session.register('ffbo.gfx.receive_partial.' + session.id, receive_partial_result).then(
       function (reg) {
          console.log('procedure registered: ffbo.gfx.receive_partial.' + session.id);
       },
       function (err) {
          console.log('failed to register procedure ffbo.gfx.receive_partial.' + session.id, err);
       }
    );
    
    function on_data_receive(args) {
        var msg = args[0];
        console.log("on_data_receive with: " + msg);
        // stop the periodic notification for circuit execution.
        clearInterval(ex_notification);
        Notify("Circuit execution completed. Visualizing result.")
        run_visualization(msg)
    };
    
    // subscribe to receive simulation finish event from neurokernel component.
    // the simulation result is returned here, use on_data_receive to extract
    // and visualize result
    session.subscribe('ffbo.nk.simulation_finish.'+session.id, on_data_receive).then(
        function (sub) {
         console.log('subscribed to simulation finish');
      },
      function (err) {
         console.log('failed to subscribe to simulation finish', err);
      }
    );
    
    function on_simulation_failure(args) {
        clearInterval(ex_notification);
        Notify("Circuit execution failed.", null, null,null,'danger')
    };
    
    // subscribe to receive simulation failure event from neurokernel component
    session.subscribe('ffbo.nk.simulation_failed.'+session.id, on_simulation_failure).then(
        function (sub) {
         console.log('subscribed to simulation failure');
      },
      function (err) {
         console.log('failed to subscribe to simulation failure', err);
      }
    );
    };

    // fired when connection was lost (or could not be established)
    //
    connection.onclose = function(reason, details) {
	console.log("Connection lost: " + reason);
	if(login_succ==false){
	    var feedback = document.getElementById('auth_feedback');
	    feedback.innerHTML = "Incorrect username or password...";
	    feedback.style.color = "red";

	}
    };

    // now actually open the connection
    //
    connection.open();
}

start_connection('guest', 'guestpass');
