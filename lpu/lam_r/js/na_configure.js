/*
 * Neuroarch Interaction
 */

var cartridge_graph;
var cartridge_node_dict = {};
var cartridge_name_to_label = {};
var alpha_process_dict = {};
// only works with cartridge number 0
//var cartridge_num = 0;
// handle returned by setInterval when using periodic notification for execution
var ex_notification;

nkpanel = new NKPanel("nk-panel");


function onOpenNK() {
    if ($(".btn-nk").hasClass('closed')) {
        $(".btn-nk").text("Close NK");
        $("#vis-svg").removeClass('vis-lg vis-hf-r')
        $("#vis-3d").removeClass('vis-sm vis-lg vis-hf-r')
        $("#vis-svg").addClass('vis-sm')
        $("#vis-3d").addClass('vis-sm-1')
        $("#nk-panel").show();
        nkpanel.showPlayBar();
    } else {
        $(".btn-nk").text("Open NK");
        $("#vis-svg").toggleClass('vis-sm vis-lg')
        $("#vis-3d").toggleClass('vis-sm-1 vis-sm')
        $("#nk-panel").hide();
        nkpanel.hidePlayBar();
    }
    $(".btn-nk").toggleClass('closed opened');
}

function run_visualization(res) {
    console.log("inputs: ", res[0])
    console.log("outputs: ", res[1])
    
    $("#vis-svg").removeClass('vis-lg vis-hf-r')
    $("#vis-3d").removeClass('vis-sm vis-lg vis-hf-r')
    $("#vis-svg").addClass('vis-sm')
    $("#vis-3d").addClass('vis-sm-1')
    $("#nk-panel").show();
    nkpanel.showPlayBar();
    
    ffboMesh.onWindowResize();
    var c = {};
    for (var key in ffboMesh.meshDict)
        c[key] = '#' + ffboMesh.meshDict[key].color.getHexString();
    
    inputs = {"ydomain": res[0]['ydomain'], "xdomain": res[0]['xdomain'], "data": {}, "color": c, "dt": res[0]["dt"]};
    for (var key in res[0]["data"]) {
        var name = cartridge_node_dict[key]["name"];
        if (name.constructor === Array) {
            for(var i = 0; i < name.length; i++) {
                inputs["data"][name[i]] = res[0]["data"][key];
            };
        }else {
            inputs["data"][name] = res[0]["data"][key]
        };
    }
    
    outputs = {"ydomain": res[1]['ydomain'], "xdomain": res[1]['xdomain'], "data": {}, "color": c, "dt": res[0]["dt"]};
    for (var key in res[1]["data"]) {
        var name = cartridge_node_dict[key]["name"];
        if (name.constructor === Array) {
            for(var i = 0; i < name.length; i++) {
                outputs["data"][name[i]] = res[1]["data"][key];
            };
        }else {
            outputs["data"][name] = res[1]["data"][key]
        };
    }

    nkpanel.updateDuration(inputs["xdomain"])
    nkpanel.updateDuration(inputs["dt"])
    
    nkpanel.updateInput(inputs)
    nkpanel.updateOutput(outputs, ffboMesh.setAnim.bind(ffboMesh));

}

function start_nk_execution(session, activeObj) {
    var nodes = cartridge_graph["nodes"];
    var edges = cartridge_graph["edges"];
    
    // neurons that will be removed by name
    // this may be associated with multiple nodes, such as bufferVoltage
    var removed_neurons = [];
    // neurons that will be removed by labels
    var removed_labels = [];
    // synapse nodes that has attribute via a?
    var removed_via = [];
    // activate objects that will need to be recorded
    var activeObj_to_label = [];
    
    
    
    for (var key in cartridge_node_dict) {
        var name = cartridge_node_dict[key]["name"];
        if (name.constructor === Array) { // Amacrine Cells
            var count = [];
            // get all the alpha processes that is not active
            for (var i = 0; i < name.length; i++) {
                var alpha_process = name[i];
                if (activeObj.indexOf(alpha_process) < 0) {
                    count.push(alpha_process);
                };
            };
            // if all alpha processes associated with the Amacrine cell
            // is not active, then remove the Amacrine cell by label
            if (count.length == name.length) {
                removed_labels.push('"' + key + '"');
            }else {
                // otherwise remove synapse nodes
                // associated with the alpha process
                for (var i = 0; i < count.length; i++) {
                    removed_via.push('"a'+ count[i][5] + '_' + cartridge_num + '"');
                }
                activeObj_to_label.push(key);
            };
        }else {
            if (activeObj.indexOf(name) < 0) {
                removed_neurons.push('"' + name + '"');
            }else {
                activeObj_to_label.push(key);
            };
        };
    };
//    for (var key in cartridge_name_to_label) {
//        if (activeObj.indexOf(key)<0) {
//            removed_neurons.push(cartridge_name_to_label[key]["label"]);
//        };
//    };
    
//    console.log(removed_neurons)
    
    
    console.log("removed neurons: ", removed_neurons)
    console.log("removed labels: ", removed_labels)
    console.log("removed via: ", removed_via)
    console.log("active labels: ", activeObj_to_label)
    
    console.log("send neuroarch function triggered");

    try {
	var server = document.getElementById("na_model_servers").options[na_model_servers.selectedIndex].value;
    } catch (err) {
	console.log("na server not valid");
    Notify("Cannot connect to any NeuroArch Server.", null, null,null,'danger')
	return;
    }
    
//    var neuron_list = [];
//    
//    for (var i = 0; i < removed_neurons.length; i++) {
//        neuron_list.push('"' + removed_neurons[i] + '"');
//    }

//    list_of_query = ['{"query":[{"action":{"method":{"has":{"name":['+removed_neurons+']}}},"object":{"state":1}},{"action":{"method":{"has":{"label":['+removed_labels+']}}},"object":{"state":1}},{"action":{"op":{"__add__":{"memory":1}}},"object":{"memory":0}},{"action":{"method":{"has":{"via":['+removed_via+']}}},"object":{"state":1}},{"action":{"op":{"__add__":{"memory":1}}},"object":{"memory":0}}],"format":"no_result"}',
//        '{"query":[{"action":{"method":{"get_connected_ports":{}}},"object":{"state":0}}],"format":"no_result"}',
//        '{"query":[{"action":{"op":{"find_matching_ports_from_selector":{"state":0}}},"object":{"state":3}}],"format":"no_result"}',
//        '{"query":[{"action":{"op":{"__add__":{"state":1}}},"object":{"state":0}}],"format":"no_result"}',
//        '{"query":[{"action":{"method":{"gen_traversal_in":{"min_depth":1, "pass_through":["SendsTo", "SynapseModel","instanceof"]}}},"object":{"state":0}}],"format":"no_result"}',
//        '{"query":[{"action":{"method":{"gen_traversal_out":{"min_depth":1, "pass_through":["SendsTo", "SynapseModel","instanceof"]}}},"object":{"state":1}}],"format":"no_result"}',
//        '{"query":[{"action":{"op":{"__add__":{"state":1}}},"object":{"state":0}},{"action":{"op":{"__add__":{"state":2}}},"object":{"memory":0}}],"format":"no_result"}',
//        '{"command":{"swap":{"states":[1,8]}},"format":"no_result"}',
//        '{"command":{"swap":{"states":[0,1]}},"format":"no_result"}',
//        '{"query":[{"action":{"op":{"__sub__":{"state":1}}},"object":{"state":0}}],"format":"nx"}'
//        ]
    
    
    list_of_query = [
        '{"command":{"swap":{"states":[0,1]}},"format":"no_result"}',
        '{"query":[{"action":{"method":{"has":{"name":['+removed_neurons+']}}},"object":{"state":0}},{"action":{"method":{"has":{"label":['+removed_labels+']}}},"object":{"state":0}},{"action":{"op":{"__add__":{"memory":1}}},"object":{"memory":0}},' +
        '{"action":{"method":{"get_connected_ports":{}}},"object":{"memory":0}},' +
        '{"action":{"method":{"has":{"via":['+removed_via+']}}},"object":{"state":0}},{"action":{"op":{"__add__":{"memory":1}}},"object":{"memory":0}},' +
        '{"action":{"op":{"find_matching_ports_from_selector":{"memory":0}}},"object":{"state":0}},' +
        '{"action":{"op":{"__add__":{"memory":1}}},"object":{"memory":0}},' +
        '{"action":{"method":{"gen_traversal_in":{"min_depth":1, "pass_through":["SendsTo", "SynapseModel","instanceof"]}}},"object":{"memory":0}},' +
        '{"action":{"method":{"gen_traversal_out":{"min_depth":1, "pass_through":["SendsTo", "SynapseModel","instanceof"]}}},"object":{"memory":1}},' +
        '{"action":{"op":{"__add__":{"memory":1}}},"object":{"memory":0}},{"action":{"op":{"__add__":{"memory":3}}},"object":{"memory":0}},' +
        '{"action":{"op":{"__sub__":{"memory":0}}},"object":{"state":0}}],"format":"nx"}'
    ]
    
    for (i = 0; i < list_of_query.length-1; i++)
    {
        query = JSON.parse(list_of_query[i])
        query["server"] = server
        query["user"] = session.id
        console.log(query)
        session.call('ffbo.processor.neuroarch_query', [query]).then(
        function(res) {
            console.log("na_query result:", res);
        },
        function(err) {
            console.log("na_query error:", err);
        });
    }
    
    query = JSON.parse(list_of_query[list_of_query.length-1])
    query["server"] = server
    query["user"] = session.id
    console.log(query)
    session.call('ffbo.processor.neuroarch_query', [query]).then(
    function(res) {
        console.log("na_query result:", res);
        Notify("Cartridge circuit updated in NeuroArch workspace.")
        send_nk_execute(session, activeObj_to_label);
    },
    function(err) {
        console.log("na_query error:", err);
    });
    
    Notify("Request to update cartridge circuit sent.")
    
    
};


// send to neurokernel for execution.
// output_neuron_list is a list of neurons that we request neurokernel
// to return their responses
function send_nk_execute(session, output_neuron_list) {
    console.log("send function triggered");

    try {
	var server = document.getElementById("nk_servers").options[nk_servers.selectedIndex].value;
    } catch (err) {
	console.log("nk server not valid");
    Notify("Cannot connect to any NeuroKernel Server.", null,null,null,'danger')
	return;
    }
    
    try {
	var na_server = document.getElementById("na_model_servers").options[na_model_servers.selectedIndex].value;
    } catch (err) {
	console.log("na server not valid");
    Notify("Cannot connect to any NeuroArch Server.", null,null,null,'danger')
	return;
    }

    msg = {}
    msg['user'] = session.id;
    msg['servers'] = {};
    msg['servers']['na_model'] = na_server;
    msg['servers']['nk'] = server;
    // neurokernel component expects that the query["neuron_list"] contains
    // a list of neurons of which the responses are returned
    msg['neuron_list'] = output_neuron_list
    
    session.call('ffbo.processor.nk_execute', [msg], {}, {
        receive_progress: true}).then(
    // Neurokernel only returns 1 if successfully started execution
    // The actual returned output is through a publish/subscribe mechanism
    // see ffbo.nk.simulation_finish and ffbo.nk.simulation_failed
    // in the connect.js
	function(res) {
	    console.log("nk_query result:", res);
//        Notify("Neurokernel received request and is executing circuit. Please wait.")
//        // start periodic notification
//        ex_notification = setInterval(notify_execution, 12000);
        clearInterval(ex_notification);
//        Notify("Circuit execution completed.")
        if ('error' in res) {
            Notify(res['error']['message'],null,null,null,'danger')
        } else if('success' in res) {
            Notify('Execution Complete. Result Visualised.');
        };
	},
	function(err) {
	    console.log("nk_query error:", err);
        //Notify("Error: Failed to start circuit execution in Neurokernel.", null,null,null,'danger')
        Notify(err,null,null,null,'danger');
        clearInterval(ex_notification);
	},
    function(progress) {
            Notify(progress);
            if (progress == "Start execution in Neurokernel") {
                ex_notification = setInterval(notify_execution, 12000);
            }
        }
    );
    
    Notify("Request to execute circuit sent to Neurokernel Server.")
    
};


function notify_execution() {
    Notify("Neurokernel execution in progress. Please wait.")
}


function construct_cartridge(session, cartridge_index) {
    console.log("send neuroarch function triggered");

    try {
        var server = document.getElementById("na_model_servers").options[na_model_servers.selectedIndex].value;
    } catch (err) {
        console.log("na server not valid");
        Notify("Cannot connect to any NeuroArch Server.", null,null,null,'danger')
	return;
    }
    
    // These are individual queries, they are combined into one big query n the next section
//    list_of_query = ['{"query":[{"action":{"method":{"query":{"name":["lamina"]}}},"object":{"class":"LPU"}},{"action":{"method":{"traverse_owns":{"cls":"CartridgeModel","name":"cartridge_' + cartridge_index +'"}}},"object":{"memory":0}}],"format":"no_result"}',//1
//    '{"query":[{"action":{"method":{"traverse_owns":{"instanceof":"MembraneModel"}}},"object":{"state":0}}], "format":"no_result"}',//2
//    '{"query":[{"action":{"method":{"traverse_owns":{"instanceof":"DendriteModel"}}}, "object":{"state":1}}], "format":"no_result"}',//3
//    '{"query":[{"action":{"op":{"__add__":{"state":0}}},"object":{"state":1}}],"format":"no_result"}',//4
//    '{"query":[{"action":{"method":{"traverse_owns":{"cls":"Port"}}},"object":{"state":3}}],"format":"no_result"}',//5 ports
//    '{"query":[{"action":{"op":{"__add__":{"state":0}}},"object":{"state":1}}],"format":"no_result"}',//6
//    '{"query":[{"action":{"method":{"gen_traversal_in":{"min_depth":2,"pass_through":[["SendsTo","SynapseModel","instanceof"],["SendsTo","MembraneModel","instanceof"]]}}},"object":{"state":0}},{"action":{"method":{"has":{"name":"Amacrine"}}},"object":{"memory":0}}],"format":"no_result"}',//7
//    '{"query":[{"action":{"method":{"gen_traversal_in":{"min_depth":2,"pass_through":[["SendsTo","SynapseModel","instanceof"],["SendsTo","Aggregator","instanceof"]]}}},"object":{"state":1}},{"action":{"method":{"has":{"name":"Amacrine"}}},"object":{"memory":0}}],"format":"no_result"}',//8
//    '{"query":[{"action":{"method":{"gen_traversal_out":{"min_depth":2,"pass_through":[["SendsTo","SynapseModel","instanceof"],["SendsTo","MembraneModel","instanceof"]]}}},"object":{"state":2}},{"action":{"method":{"has":{"name":"Amacrine"}}},"object":{"memory":0}}],"format":"no_result"}',//9
//    '{"query":[{"action":{"method":{"gen_traversal_out":{"min_depth":2,"pass_through":[["SendsTo","SynapseModel","instanceof"],["SendsTo","Aggregator","instanceof"]]}}},"object":{"state":3}},{"action":{"method":{"has":{"name":"Amacrine"}}},"object":{"memory":0}}],"format":"no_result"}',//10 -- ports
//    '{"command":{"swap":{"states":[0,5]}},"format":"no_result"}',
//    '{"query":[{"action":{"op":{"__add__":{"state":1}}},"object":{"state":5}}],"format":"no_result"}',//11
//    '{"query":[{"action":{"op":{"__add__":{"state":3}}},"object":{"state":0}}],"format":"no_result"}',//12
//    '{"query":[{"action":{"op":{"__add__":{"state":5}}},"object":{"state":0}}],"format":"no_result"}',//13
//    '{"query":[{"action":{"op":{"__add__":{"state":7}}},"object":{"state":0}}],"format":"no_result"}',//14
//    '{"query":[{"action":{"method":{"get_connecting_synapsemodels":{}}},"object":{"state":0}}],"format":"no_result"}',//15 --> ports
//    '{"query":[{"action":{"op":{"__add__":{"state":1}}},"object":{"state":0}}],"format":"no_result"}',//16
//    '{"command":{"swap":{"states":[6,1]}},"format":"no_result"}',
//    '{"query":[{"action":{"method":{"get_connected_ports":{}}},"object":{"state":6}}],"format":"no_result"}',//17
//    '{"query":[{"action":{"op":{"__add__":{"state":1}}},"object":{"state":0}}],"format":"no_result"}',//18 lam_comps
//    '{"query":[{"action":{"method":{"query":{"name":["retina-lamina"]}}},"object":{"class":"Pattern"}}],"format":"no_result"}',//19
//    '{"query":[{"action":{"method":{"owns":{"cls":"Interface"}}},"object":{"state":0}}],"format":"no_result"}',//20
//    '{"query":[{"action":{"op":{"__add__":{"state":0}}},"object":{"state":1}}],"format":"no_result"}',//21
//    '{"query":[{"action":{"op":{"find_matching_ports_from_selector":{"state":6}}},"object":{"state":1}}],"format":"no_result"}',//22
//    '{"query":[{"action":{"op":{"__add__":{"state":0}}},"object":{"state":1}}],"format":"no_result"}',//23
//    '{"query":[{"action":{"method":{"get_connected_ports":{}}},"object":{"state":0}}],"format":"no_result"}',//24
//    '{"query":[{"action":{"op":{"__add__":{"state":0}}},"object":{"state":1}}],"format":"no_result"}',//25 pat1
//    '{"query":[{"action":{"method":{"query":{"name":["retina"]}}},"object":{"class":"LPU"}}],"format":"no_result"}',//26 -> lam_comps
//    '{"query":[{"action":{"op":{"find_matching_ports_from_selector":{"state":1}}},"object":{"state":0}}],"format":"no_result"}',//27
//    '{"command":{"swap":{"states":[1,9]}},"format":"no_result"}',
//    '{"query":[{"action":{"method":{"gen_traversal_in":{"pass_through":["SendsTo", "MembraneModel","instanceof"]}}},"object":{"state":0}}],"format":"no_result"}',//28 ret_comp
//    '{"query":[{"action":{"op":{"__add__":{"state":2}}},"object":{"state":0}}],"format":"no_result"}',//29
//    '{"query":[{"action":{"op":{"__add__":{"state":4}}},"object":{"state":0}}],"format":"no_result"}',//30
//    '{"query":[{"action":{"method":{"has":{}}},"object":{"state":0}}],"format":"nx"}']//31
//
    
    list_of_query = [
    '{"query":[{"action":{"method":{"query":{"name":["lamina"]}}},"object":{"class":"LPU"}},{"action":{"method":{"traverse_owns":{"cls":"CartridgeModel","name":"cartridge_' + cartridge_index +'"}}},"object":{"memory":0}},'+ //1
    '{"action":{"method":{"traverse_owns":{"instanceof":"MembraneModel"}}},"object":{"memory":0}},'+ //2
    '{"action":{"method":{"traverse_owns":{"instanceof":"DendriteModel"}}}, "object":{"memory":1}},'+ //3
    '{"action":{"op":{"__add__":{"memory":0}}},"object":{"memory":1}},'+ //4
    '{"action":{"method":{"traverse_owns":{"cls":"Port"}}},"object":{"memory":3}},'+ //5
    '{"action":{"op":{"__add__":{"memory":0}}},"object":{"memory":1}},' +//6
    '{"action":{"method":{"gen_traversal_in":{"min_depth":2,"pass_through":[["SendsTo","SynapseModel","instanceof"],["SendsTo","MembraneModel","instanceof"]]}}},"object":{"memory":0}},{"action":{"method":{"has":{"name":"Amacrine"}}},"object":{"memory":0}},' +//7
    '{"action":{"method":{"gen_traversal_in":{"min_depth":2,"pass_through":[["SendsTo","SynapseModel","instanceof"],["SendsTo","Aggregator","instanceof"]]}}},"object":{"memory":2}},{"action":{"method":{"has":{"name":"Amacrine"}}},"object":{"memory":0}},' +//8
    '{"action":{"method":{"gen_traversal_out":{"min_depth":2,"pass_through":[["SendsTo","SynapseModel","instanceof"],["SendsTo","MembraneModel","instanceof"]]}}},"object":{"memory":4}},{"action":{"method":{"has":{"name":"Amacrine"}}},"object":{"memory":0}},' + //9
    '{"action":{"method":{"gen_traversal_out":{"min_depth":2,"pass_through":[["SendsTo","SynapseModel","instanceof"],["SendsTo","Aggregator","instanceof"]]}}},"object":{"memory":6}},{"action":{"method":{"has":{"name":"Amacrine"}}},"object":{"memory":0}},' + //10 -- ports
    '{"action":{"op":{"__add__":{"memory":2}}},"object":{"memory":0}},' + //11
    '{"action":{"op":{"__add__":{"memory":6}}},"object":{"memory":0}},' + //12
    '{"action":{"op":{"__add__":{"memory":8}}},"object":{"memory":0}},' + //13
    '{"action":{"op":{"__add__":{"memory":11}}},"object":{"memory":0}},' + //14
    '{"action":{"method":{"get_connecting_synapsemodels":{}}},"object":{"memory":0}},' + //15 --> ports
    '{"action":{"op":{"__add__":{"memory":1}}},"object":{"memory":0}},' + //16
    '{"action":{"method":{"get_connected_ports":{}}},"object":{"memory":1}},' + //17
    '{"action":{"op":{"__add__":{"memory":1}}},"object":{"memory":0}},' + //18 lam_comps
    '{"action":{"method":{"query":{"name":["retina-lamina"]}}},"object":{"class":"Pattern"}},' + //19
    '{"action":{"method":{"owns":{"cls":"Interface"}}},"object":{"memory":0}},' + //20
    '{"action":{"op":{"__add__":{"memory":0}}},"object":{"memory":1}},' + //21
    '{"action":{"op":{"find_matching_ports_from_selector":{"memory":20}}},"object":{"memory":1}},' +  //22
    '{"action":{"op":{"__add__":{"memory":0}}},"object":{"memory":1}},' + //23
    '{"action":{"method":{"get_connected_ports":{}}},"object":{"memory":0}},' + //24
    '{"action":{"op":{"__add__":{"memory":0}}},"object":{"memory":1}},' + //25 pat1
    '{"action":{"method":{"query":{"name":["retina"]}}},"object":{"class":"LPU"}},' + //26 -> lam_comps
    '{"action":{"op":{"find_matching_ports_from_selector":{"memory":1}}},"object":{"memory":0}},' + //27
    '{"action":{"method":{"gen_traversal_in":{"pass_through":["SendsTo", "MembraneModel","instanceof"]}}},"object":{"memory":0}},' + //28 ret_comp
    '{"action":{"op":{"__add__":{"memory":10}}},"object":{"memory":0}},' + //29
    '{"action":{"op":{"__add__":{"memory":4}}},"object":{"memory":0}}],' + //30
    '"format":"no_result"}',
    '{"query":[{"action":{"method":{"has":{}}},"object":{"state":0}}],"format":"nx"}']
    
    //send out the first N-1 queries
    for (i = 0; i < list_of_query.length-1; i++)
    {
        query = JSON.parse(list_of_query[i])
        query["server"] = server
        query["user"] = session.id
        console.log(query)
        session.call('ffbo.processor.neuroarch_query', [query]).then(
        function(res) {
            console.log("na_query result:", res);
        },
        function(err) {
            console.log("na_query error:", err);
        });
    }
    
    // send out the last query,
    // we make sure that the second to last query is the entire cartridge
    // that we will always start with when having a new configuration
    query = JSON.parse(list_of_query[list_of_query.length-1])
    query["server"] = server
    query["user"] = session.id
    console.log(query)
    session.call('ffbo.processor.neuroarch_query', [query]).then(
    function(res) {
        // cartridge info loaded, update frontend
        console.log("na_query result:", res);
        if("success" in res){
            process_na_result_in_nx_format(res);
            cartridge_data_set = true;
            $("#num-of-cartridge").text("Cartridge #" + cartridge_num + ", Number of Neurons: "+getNeuronCount())
            Notify("Cartridge info loaded.")
        }
    },
    function(err) {
        console.log("na_query error:", err);
        Notify("Failed to load cartridge info.", null,null,null,'danger')
    });
    
    Notify("Request to load cartridge sent.")
    
};


// process query result for a cartridge
function process_na_result_in_nx_format(res) {
    cartridge_graph = res["success"]["result"];
    var nodes = cartridge_graph["nodes"];
    var edges = cartridge_graph["edges"];
    // maps from unique labels -> key and name of the neuron.
    // for columnar neurons, name is unique and "name" is a string.
    // for Amacrine cell, name is a list containing the name of alpha processes.
    cartridge_node_dict = {}
    // maps name of neuron in the svg -> label and key of component in graph
    cartridge_name_to_label = {};
    // maps each alpha process -> label and key of amacrine cell component in graph
    alpha_process_dict = {};
    
    for (var key in nodes){
        if (Object.keys(nodes[key]).indexOf("name") > -1) {
            if (["MorrisLecar","PhotoreceptorModel"].indexOf(nodes[key]["class"]) > -1) {
                var name = nodes[key]["name"];
                var label = nodes[key]["label"];
                
                if (name != "Amacrine") {
                    cartridge_node_dict[label] = {"key": key, "name": name};
                    cartridge_name_to_label[name] = {"label": label, "key": key};
                }else {
                    cartridge_node_dict[label] = {"key": key, "name": []};
                    for (var edge_key in edges[key]) {
                        var synapse_node = nodes[edge_key];
                        if (Object.keys(synapse_node).indexOf("via") > -1) {
                            if (!(synapse_node['post'] == 'Am' && synapse_node['pre'] == 'Am')) {
                                var alpha_process = "alpha"+nodes[edge_key]["via"][1];
                                if (Object.keys(alpha_process_dict).indexOf(alpha_process) < 0) {
                                    alpha_process_dict[alpha_process] = label;
                                    cartridge_node_dict[label]["name"].push(alpha_process);
                                    cartridge_name_to_label[alpha_process] = {"label": label, "key": key};
                                };
                            };
                        };
                    };
                };
            };
        };
    };
    console.log(cartridge_node_dict);
};

// Load Cartridge button clicking event
//var update_cartridge_btn = document.getElementById('update-cartridge-btn');
//update_cartridge_btn.addEventListener('click', function(event) {
//    construct_cartridge(client_session, cartridge_num);
//});

