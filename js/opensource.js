// * * * * Tab Navigation * * * * //

$("a.nav-link").click(function(event) {
    let tabId = event.target.id;

    if (tabId == "tab_import") {
        let data = { graph: exportData(tree.nodes(root)[0]) };
        if (deviceData.length > 0) {
            data.devices = deviceData;
        }
        $("textarea#importData").val(JSON.stringify(data));
    }
});



// Open Source

// * * * * Load data * * * * //

let data_2fa_directory = [];
let search_results = [];

// 2FA.directory v3
$.getJSON("https://api.2fa.directory/v3/all.json", function(result) {
    data_2fa_directory = result;
    $("span#formSourceNumResults").html(data_2fa_directory.length);
});

$("input#formSearchURL").change(function() {
    search_results = [];
    let query = $("input#formSearchURL").val();
    if (query.trim().length > 0) {
        search_results = data_2fa_directory.filter(function(val) {
            return val[1] && val[1].domain.toLowerCase().includes(query.toLowerCase());
        });
    }
    let resultsHTML = "";
    for (let i = 0; i < search_results.length; i++) {
        resultsHTML += '<button type="button" class="list-group-item list-group-item-action" onclick="showGraph(' + i + ')">' + search_results[i][1].domain + '</button>';
    }
    $("div#formSearchResults").html(resultsHTML);
});

$("input#formSearchPasswordEnabled").change(function() {
    let pwEnabled = $("input#formSearchPasswordEnabled").prop("checked");
    if (selectedGraphIndex > -1) {
        showGraph(selectedGraphIndex);
    }
})

let selectedGraphIndex = -1;

function showGraph(index) {
    selectedGraphIndex = index;
    let selection = search_results[index];
    // Parse information to graph
    let g = setGraph_2fa_factory(selection);

    // Display graph

    $("div#graphLabel").html("Graph: " + selection[0]);
    root = g;
    refreshGraph();

}

function setGraph_2fa_factory(obj) {
    let pwEnabled = $("input#formSearchPasswordEnabled").prop("checked");
    let name = obj[0];
    let mfaMethods = obj[1].tfa;

    if (!mfaMethods) {
        mfaMethods = [];
    }


    let mfaGraphNodes = [];
    for (let i = 0; i < mfaMethods.length; i++) {
        let n = {
            "type": "",
            "value": "",
            "label": "",
            score: 0
        };
        // Todo: distinguish between scoring schemes
        if (mfaMethods[i] === "custom-software" && obj[1]["custom-software"]) {
            // Add node for each software
            let customSoftware = obj[1]["custom-software"];
            for (let j = 0; j < customSoftware.length; j++) {
                mfaGraphNodes.push({
                    "type": "authentication",
                    "value": "software",
                    "label": customSoftware[j],
                    score: 2
                });
            }
        } else if (mfaMethods[i] === "custom-hardware" && obj[1]["custom-hardware"]) {
            // Add node for each hardware
            let customHardware = obj[1]["custom-hardware"];
            n["type"] = "authentication";
            n["score"] = 3;
            n["value"] = "hardware";
            for (let j = 0; j < customHardware.length; j++) {
                mfaGraphNodes.push({
                    "type": "authentication",
                    "value": "hardware",
                    "label": customHardware[j],
                    score: 3
                });
            }
        } else if (mfaMethods[i] === "totp" || mfaMethods[i] === "sms" || mfaMethods[i] === "call") {
            n["type"] = "authentication";
            n["score"] = 2;
            n["value"] = "software";
            n["label"] = mfaMethods[i];
            mfaGraphNodes.push(n);
        } else if (mfaMethods[i] === "email") {
            n["type"] = "account";
            n["score"] = 1;
            n["label"] = mfaMethods[i];
            mfaGraphNodes.push(n);
        } else if (mfaMethods[i] === "u2f") {
            n["type"] = "authentication";
            n["score"] = 3;
            n["value"] = "hardware";
            n["label"] = mfaMethods[i];
            mfaGraphNodes.push(n);
        } else {
            n["type"] = "authentication";
            n["label"] = mfaMethods[i];
            mfaGraphNodes.push(n);
        }

    }


    let hasMFA = mfaGraphNodes.length > 0;
    let hasPW = pwEnabled;

    let children = [];
    if (hasPW && hasMFA) {
        let mfaChildren = [];
        if (mfaGraphNodes.length > 1) {
            mfaChildren = {
                "type": "operator",
                "value": "|",
                "score": 0,
                "children": mfaGraphNodes
            };

        } else {
            mfaChildren = mfaGraphNodes[0];
        }
        children = [{
            "type": "operator",
            "value": "&",
            "score": 0,
            "children": [
                { "type": "authentication", "value": "password", "label": "Password", "score": 1 },
                mfaChildren
            ]
        }];
    } else if (hasPW) {
        children = { "type": "authentication", "value": "password", "label": "Password", "score": 1 };
    } else if (hasMFA) {
        if (mfaGraphNodes.length > 1) {
            children = [{
                "type": "operator",
                "value": "|",
                "score": 0,
                "children": mfaGraphNodes
            }];
        } else {
            children = mfaGraphNodes;
        }
    }

    return {
        "type": "account",
        "label": name,
        "score": 0,
        "children": children
    };
}




// * * * * Node operations * * * * //

function deselect() {
    $("div#graph-node-ui").hide();
    selectedNode = null;
    d3.selectAll('.node-selected').classed("node-selected", false);
    $("div#formAddChild").hide();
    $("div#formAccount").hide();
    $("div#formNode").hide();
    $("div#formOperator").hide();
    $("div#formGraph").hide();
    $("div#toolbox-node-selected").hide();
    $("div#toolbox-node-not-selected").show();
}

function selectOperator() {
    $("div#formAccount").hide();
    $("div#formNode").hide();
    $("div#formGraph").hide();
    $("div#formAddChild").show();
    $("div#formOperator").show();
    $("select#formOperatorValue").val(selectedNode.value);
}

$("select#formOperatorValue").change(function() {
    selectedNode.value = $("select#formOperatorValue").val();
    update();
});

function selectNode() {
    $("div#formOperator").hide();
    $("div#formAccount").hide();
    $("div#formGraph").hide();
    $("div#formAddChild").show();
    $("div#formNode").show();
    $("select#formNodeValue").val(selectedNode.value);
    $("input#formNodeLabel").val(selectedNode.label);
    $("input#formNodeId").val(selectedNode.nodeId);
    $("input#formNodeScore").val(selectedNode.score);
    for (let i = 0; i < deviceData.length; i++) {
        if (selectedNode.devices && selectedNode.devices.includes(deviceData[i].id)) {
            $("input#nodeDeviceList" + i).prop("checked", true);
        } else {
            $("input#nodeDeviceList" + i).prop("checked", false);
        }
    }
}

function collapse() {
    if (selectedNode != null) {
        let d = selectedNode;
        if ((d.children != null && d.children.length > 0 && d.children[0].type !== "") || d._children != null) {
            if (d.children) {
                $("i#graph-ui-collapse-icon").removeClass("bi-arrows-collapse");
                $("i#graph-ui-collapse-icon").addClass("bi-arrows-expand");
                $("i#graph-ui-collapse-icon").attr("title", "Expand children");
                d3.selectAll('.node-selected').classed("node-collapsed", true);
                d._children = d.children;
                d.children = null;
            } else {
                $("i#graph-ui-collapse-icon").removeClass("bi-arrows-expand");
                $("i#graph-ui-collapse-icon").addClass("bi-arrows-collapse");
                $("i#graph-ui-collapse-icon").attr("title", "Collapse children");
                d3.selectAll('.node-selected').classed("node-collapsed", function(d) { return selectedNode !== d });
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
    }
}

function moveLeft() {
    if (selectedNode != null) {
        let d = selectedNode;
        let nodeId = d.nodeId;
        let parent = d.parent;
        for (let i = 0; i < parent.children.length; i++) {
            if (parent.children[i].nodeId === nodeId) {
                if (i > 0) {
                    let tmp = parent.children[i - 1];
                    parent.children[i - 1] = parent.children[i]
                    parent.children[i] = tmp;
                    break;
                }
            }
        }
        update(parent);
    }
}

function moveRight() {
    if (selectedNode != null) {
        let d = selectedNode;
        let nodeId = d.nodeId;
        let parent = d.parent;
        for (let i = 0; i < parent.children.length; i++) {
            if (parent.children[i].nodeId === nodeId) {
                if (i + 1 < parent.children.length) {
                    let tmp = parent.children[i + 1];
                    parent.children[i + 1] = parent.children[i]
                    parent.children[i] = tmp;
                    break;
                }
            }
        }
        update(parent);
    }

}

function deleteNode() {
    let target = selectedNode;
    let children = [];
    target.parent.children.forEach(function(child) {
        if (child.id != target.id) {
            children.push(child);
        }
    });
    target.parent.children = children;
    update(root);
    deselect();
}



function nodeDeviceListChange(el, id) {
    if ($("input#" + el.id).prop("checked")) {
        if (!selectedNode.devices) {
            selectedNode.devices = [];
        }
        selectedNode.devices.push(id);
    } else {
        for (let i = 0; i < selectedNode.devices.length; i++) {
            if (selectedNode.devices[i] === id) {
                selectedNode.devices.splice(i, 1);
            }
        }
    }
    update();
}

$("select#formNodeValue").change(function() {
    selectedNode.value = $("select#formNodeValue").val();
    switch (selectedNode.value) {
        case "knowledge":
            selectedNode.score = 1;
            break;
        case "software":
            selectedNode.score = 2;
            break;
        case "hardware":
            selectedNode.score = 3;
            break;
    }
    $("input#formNodeScore").val(selectedNode.score);
    update();
});

$("input#formNodeLabel").change(function() {
    selectedNode.label = $("input#formNodeLabel").val();
    update();
});

$("input#formNodeId").change(function() {
    selectedNode.nodeId = $("input#formNodeId").val();
    update();
});

$("input#formNodeScore").change(function() {
    selectedNode.score = $("input#formNodeScore").val();
    update();
});

function generateRandomNodeId() {
    return Math.random().toString(36).slice(2, 7);
}

function selectAccount() {
    $("div#formOperator").hide();
    $("div#formNode").hide();
    $("div#formGraph").hide();
    $("div#formAddChild").show();
    $("div#formAccount").show();
    $("input#formAccountName").val(selectedNode.label);
    $("input#formAccountNodeId").val(selectedNode.nodeId);
}

$("input#formAccountName").change(function() {
    selectedNode.label = $("input#formAccountName").val();
    update();
})

$("input#formAccountNodeId").change(function() {
    selectedNode.nodeId = $("input#formAccountNodeId").val();
    update();
})

function selectGraph() {
    $("div#formOperator").hide();
    $("div#formNode").hide();
    $("div#formAccount").hide();
    $("div#formAddChild").hide();
    $("div#formGraph").show();
}

$("button#formGraphBtnImport").click(function() {
    let input = $("textarea#formGraphInput").val();
    $("textarea#formGraphInput").val("");
    let subgraph = JSON.parse(input);

    // reset device list of nodes
    //removeDevicesFromGraph(subgraph.graph);

    let target = selectedNode;
    let children = [];
    target.parent.children.forEach(function(child) {
        if (child.id != target.id) {
            children.push(child);
        } else {
            children.push(subgraph.graph);
        }
    });
    if (subgraph.devices && subgraph.devices.length > 0) {
        deviceData = deviceData.concat(subgraph.devices);
        updateDeviceList();
    }
    target.parent.children = children;
    update(root);
    deselect();
});

$("input#formGraphFileInput").change(function(event) {
    const fileList = event.target.files;

    if (fileList.length > 0) {
        const file = fileList[0];
        if (file.type !== 'application/json') {
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            $("input#formGraphFileInput").val("");
            $("textarea#formGraphInput").val(reader.result);
        });

        reader.readAsText(file)
    }
});

$("button#btnAddNode").click(function() {
    if (selectedNode.children == null || selectedNode.children == undefined) {
        selectedNode.children = [];
    }

    var child = new Object();
    child.nodeId = generateRandomNodeId();
    child.value = "";
    child.score = 0;
    child.recovery = 0;

    switch ($("select#selectAddChild").val()) {
        case "Account":
            child.type = "account";
            child.label = "Label";
            child.score = 1;
            break;
        case "Authentication":
            child.type = "authentication";
            child.label = "Label";
            child.devices = [];
            break;
        case "Operator":
            child.type = "operator";
            child.value = "";
            break;
        case "Graph":
            child.type = "graph";
            break;
        default:
            break;
    }
    child.children = [];
    selectedNode.children.push(child);
    update(root);
});

$("button#btnDeleteNode").click(function() {
    let target = selectedNode;
    let children = [];
    target.parent.children.forEach(function(child) {
        if (child.id != target.id) {
            children.push(child);
        }
    });
    target.parent.children = children;
    update(root);
    deselect();
});


click = function(d) {
    if (selectedNode === d) {
        deselect();
        return;
    }
    selectedNode = d;

    const triggerFirstTabEl = document.querySelector('#myTab li:first-child a')
    bootstrap.Tab.getInstance(triggerFirstTabEl).show()

    if ((d.children != null && d.children.length > 0 && d.children[0].type !== "") || d._children != null) {
        $("button#btnCollapseNode").prop('disabled', false);
    } else {
        $("button#btnCollapseNode").prop('disabled', true);
    }
    if (d.type === "operator") {
        d3.selectAll('.node-selected').classed("node-selected", false);
        d3.select(this).selectAll("circle.operator-node").classed("node-selected", true);
        selectOperator(d);
    } else if (d.type === "authentication") {
        d3.selectAll('.node-selected').classed("node-selected", false);
        d3.select(this).selectAll("rect").classed("node-selected", true);
        selectNode();

    } else if (d.type === "account") {
        d3.selectAll('.node-selected').classed("node-selected", false);
        d3.select(this).selectAll("rect").classed("node-selected", true);
        selectAccount();
    } else if (d.type === "graph") {
        d3.selectAll('.node-selected').classed("node-selected", false);
        d3.select(this).selectAll("rect").classed("node-selected", true);
        selectGraph();
    }
    if (d3.select('.node-selected').classed("node-collapsed")) {
        $("i#graph-ui-collapse-icon").removeClass("bi-arrows-collapse");
        $("i#graph-ui-collapse-icon").addClass("bi-arrows-expand");
        $("i#graph-ui-collapse-icon").attr("title", "Expand children");
    } else {
        $("i#graph-ui-collapse-icon").removeClass("bi-arrows-expand");
        $("i#graph-ui-collapse-icon").addClass("bi-arrows-collapse");
        $("i#graph-ui-collapse-icon").attr("title", "Collapse children");
    }
    $("div#toolbox-node-not-selected").hide();
    $("div#toolbox-node-selected").show();
    $("div#graph-node-ui").show();
}

function removeDeviceEditor(id) {
    removeDevice(id);
    updateDeviceList();
}

function updateDeviceList() {
    let deviceListHTML = "";
    let nodeDeviceListHTML = "";
    for (let i = 0; i < deviceData.length; i++) {
        deviceListHTML += '<li class="list-group-item"">' + deviceData[i].label + ' <span class="float-end" onclick="removeDeviceEditor(\'' + deviceData[i].id + '\')"><i class="bi bi-x-circle delete-icon"></i></span></li>';
        nodeDeviceListHTML += `<li class="list-group-item">
        <input class="form-check-input me-1" onchange="nodeDeviceListChange(this,\'` + deviceData[i].id + `\')" type="checkbox" id="nodeDeviceList` + i + `">
        <label class="form-check-label stretched-link" for="nodeDeviceList` + i + `">` + deviceData[i].label + `</label>
      </li>`;

    }
    $("ul#formDeviceList").html(deviceListHTML);
    $("ul#formNodeDeviceList").html(nodeDeviceListHTML);
}

$("button#formDeviceBtnAdd").click(function() {
    let name = $("input#formDeviceName").val()
    deviceData.push({ id: generateRandomDeviceId(), label: name });
    $("input#formDeviceName").val("");
    updateDeviceList();
    update();
});

// Import / Export

$("button#btnImport").click(function() {
    let data = JSON.parse($("textarea#importData").val());
    root = data.graph;
    if (data.devices) {
        deviceData = data.devices;
    } else {
        deviceData = [];
    }

    updateDeviceList();
    update(root);
    // Call twice to get Ids
    update(root);
    alignGraph();
});

$("input#formImportFileInput").change(function(event) {
    const fileList = event.target.files;

    if (fileList.length > 0) {
        const file = fileList[0];
        if (file.type !== 'application/json') {
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            $("input#formImportFileInput").val("");
            $("textarea#importData").val(reader.result);
        });

        reader.readAsText(file)
    }
});

function downloadJSON() {
    let data = { graph: exportData(tree.nodes(root)[0]) };
    if (deviceData.length > 0) {
        data.devices = deviceData;
    }
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", root.label + "_graph.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};


update(root);