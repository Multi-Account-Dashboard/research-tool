// Graph
document.Graph.onNodeEnter = function(nodeEnter) {
    if (tabId === "tab_statistics") {
        if ($("select#formStatisticsView").val() === "frequency") {
            // Add label fields like circles, etc.
            nodeEnter.filter(function(d) {
                    return d.type == 'operator';
                }).append("circle")
                .style("fill", "#fff")
                .style("stroke", "#000")
                .style("stroke-width", "1px")
                .attr("r", 15)
                .attr("cx", 20)
                .attr("cy", -10);

            nodeEnter.filter(function(d) {
                    return d.type == 'operator';
                }).append("text")
                .style("font", " 12px sans-serif")
                .attr("class", "node-custom-value")
                .attr("x", 20)
                .attr("y", -10)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle");

            nodeEnter.filter(function(d) {
                    return d.type == 'authentication' || d.type == 'account';
                }).append("circle")
                .style("fill", "#fff")
                .style("stroke", "#000")
                .style("stroke-width", "1px")
                .attr("r", 15)
                .attr("cx", 5 + document.Graph.settings.nodeWidth / 2)
                .attr("cy", -document.Graph.settings.nodeHeight / 2);

            nodeEnter.filter(function(d) {
                    return d.type == 'authentication' || d.type == 'account';
                }).append("text")
                .style("font", " 12px sans-serif")
                .attr("class", "node-custom-value")
                .attr("x", 5 + document.Graph.settings.nodeWidth / 2)
                .attr("y", -document.Graph.settings.nodeHeight / 2)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle");
        }
        /* else if ($("select#formStatisticsView").val() === "security_scores") {
                    nodeEnter.append("rect")
                        .style("fill", "#fff")
                        .style("stroke", "#000")
                        .style("stroke-width", "1px")
                        .attr("x", function(d) {
                            if (d.type === "operator") {
                                return 20;
                            } else {
                                return 50;
                            }
                        })
                        .attr("y", -35)
                        .attr("width", 70)
                        .attr("height", 70)
                        .attr("background", "white");

                    nodeEnter.append("text")
                        .style("font", " 12px sans-serif")
                        .attr("class", "node-score-max")
                        .attr("x", function(d) {
                            if (d.type === "operator") {
                                return 25;
                            } else {
                                return 55;
                            }
                        })
                        .attr("y", -20)
                        .attr("text-anchor", "left")
                        .attr("alignment-baseline", "middle");
                    nodeEnter.append("text")
                        .style("font", " 12px sans-serif")
                        .attr("class", "node-score-mean")
                        .attr("x", function(d) {
                            if (d.type === "operator") {
                                return 25;
                            } else {
                                return 55;
                            }
                        })
                        .attr("y", 0)
                        .attr("text-anchor", "left")
                        .attr("alignment-baseline", "middle");
                    nodeEnter.append("text")
                        .style("font", " 12px sans-serif")
                        .attr("class", "node-score-min")
                        .attr("x", function(d) {
                            if (d.type === "operator") {
                                return 25;
                            } else {
                                return 55;
                            }
                        })
                        .attr("y", 20)
                        .attr("text-anchor", "left")
                        .attr("alignment-baseline", "middle");
                }*/
    }
}

document.Graph.onNodeUpdate = function(node) {
    // Update values of label fields 

    if (tabId === "tab_statistics") {
        if ($("select#formStatisticsView").val() === "frequency") {
            node.selectAll("text.node-custom-value")
                .text(function(d) {
                    return frequencyMap[d.nodeId] ? frequencyMap[d.nodeId] : "0";
                });
        }
        /* else if ($("select#formStatisticsView").val() === "security_scores") {
                    node.selectAll("text.node-score-max")
                        .text(function(d) {
                            return securityScoreMap[d.nodeId] ? "Max: " + securityScoreMap[d.nodeId].max : "Max: n/a";
                        });
                    node.selectAll("text.node-score-mean")
                        .text(function(d) {
                            return securityScoreMap[d.nodeId] ? "Mean: " + (securityScoreMap[d.nodeId].sum / securityScoreMap[d.nodeId].n).toFixed(2) : "Mean: n/a";
                        });
                    node.selectAll("text.node-score-min")
                        .text(function(d) {
                            return securityScoreMap[d.nodeId] ? "Min: " + securityScoreMap[d.nodeId].min : "Min: n/a";
                        });
                }*/

    }
}

click = function(d) {
    d3.selectAll("rect").classed("node-selected", false);
    d3.selectAll("circle.operator-node").classed("node-selected", false);

    if (selectedNode == d) {
        selectedNode = null;
        return
    }

    selectedNode = d;
    if (d.type === "operator") {
        d3.select(this).selectAll("circle.operator-node").classed("node-selected", true);
    } else if (d.type === "authentication") {
        d3.select(this).selectAll("rect").classed("node-selected", true);
    } else if (d.type === "account") {
        d3.select(this).selectAll("rect").classed("node-selected", true);
    } else if (d.type === "graph") {
        d3.select(this).selectAll("rect").classed("node-selected", true);
    }
}



// * * * * Tab Navigation * * * * //

let tabId = "tab_model";
$("a.nav-link").click(function(event) {
    tabId = event.target.id;

    if (tabId === "tab_model") {
        document.Graph.settings.showScore = "all";
        showOriginalModel();
    } else if (tabId === "tab_data") {
        document.Graph.settings.showScore = "all";
        if (resultDataSelected > -1) {
            showDataGraph();
        } else {
            showOriginalModel();
        }
    } else if (tabId === "tab_statistics") {
        updateStatisticsView();
    }
});

// Model
let modelData = null;

function showOriginalModel() {

    root = {};
    deviceData = [];
    $("div#graphLabel").html("");
    update(root);
    if (modelData !== null) {
        root = modelData.graph;
        if (modelData.devices) {
            deviceData = modelData.devices;
        } else {
            deviceData = [];
        }
        if (root.label) {
            $("div#graphLabel").html("Model: " + root.label);
        }

        update(root);
        // Call twice to get Ids
        update(root);
    }
}

$("button#btnImportModel").click(function() {
    showOriginalModel();
    alignGraph();
});

$("input#formImportModelFileInput").change(function(event) {
    const fileList = event.target.files;
    modelData = null;

    if (fileList.length > 0) {
        const file = fileList[0];
        if (file.type !== 'application/json') {
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            modelData = JSON.parse(reader.result);
        });

        reader.readAsText(file)
    }
});

// Data

let resultDataImport = null;
let resultData = []; // List of graphs and devices
let resultDataSelected = -1;

function showDataGraph() {
    if (resultData.length === 0 || resultDataSelected < 0)
        return;
    root = resultData[resultDataSelected].graph;
    if (resultData[resultDataSelected].devices) {
        deviceData = resultData[resultDataSelected].devices;
    } else {
        deviceData = [];
    }

    $("div#graphLabel").html("Data: " + resultData[resultDataSelected].id);

    update(root);
    // Call twice to get Ids
    update(root);
}

/*function formDataSelectGraph(el, index) {
    let previous = $("a.form-data-graph-item.active");
    previous.removeClass("active");
    if (previous.get(0) !== el) {
        resultDataSelected = index;
        $(el).addClass("active")
        showDataGraph();
    } else {
        resultDataSelected = -1;
        // Show original model if unselected
        showOriginalModel();
    }
}*/

function updateDataView() {
    let index = parseInt($("select#formDataList").val());
    resultDataSelected = index;
    showDataGraph();
}

$("select#formDataList").change(function() {
    updateDataView();
});

$("button#btnImportData").click(function() {
    if (resultDataImport === null) {
        return
    }

    resultData = resultDataImport;

    dataListHTML = "";
    // Todo: Create clickable list of results
    for (let i = 0; i < resultData.length; i++) {
        dataListHTML += '<option value="' + i + '">' + resultData[i].id + '</option>';
    }
    $("select#formDataList").html(dataListHTML);
    $("select#formDataList").show();

    getGraphPatterns();
    updateDataView();
    updateFormPatternSelection();
    updateFormStatisticsGraphSelection();
});

$("input#formImportDataFileInput").change(function(event) {
    const fileList = event.target.files;
    resultData = null;

    if (fileList.length > 0) {
        const file = fileList[0];
        if (file.type !== 'application/json') {
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            resultDataImport = JSON.parse(reader.result);
        });

        reader.readAsText(file)
    }
});


// Statistics

function updateStatisticsView() {
    $("select#formStatisticsPatternList").hide();
    $("select#formStatisticsDataList").hide();
    $("div#formStatisticsRecoveryScores").hide();
    $("div#formStatisticsSecurityScores").hide();
    if ($("select#formStatisticsView").val() === "frequency") {
        calculateFrequencies();
        showOriginalModel();
    } else if ($("select#formStatisticsView").val() === "security_scores") {
        $("select#formScoringView").val("Security");
        updateFormSecurityScores();
        $("div#formStatisticsSecurityScores").show();
        $("select#formStatisticsDataList").show();
    } else if ($("select#formStatisticsView").val() === "recovery_scores") {
        $("select#formScoringView").val("Recovery");
        updateFormRecoveryScores();
        $("div#formStatisticsRecoveryScores").show();
        $("select#formStatisticsDataList").show();
    } else if ($("select#formStatisticsView").val() === "graph_patterns") {
        $("select#formStatisticsPatternList").show();
        $("select#formStatisticsDataList").show();
        updateFormStatisticsGraphSelection();
    }
}

$("select#formStatisticsView").change(function() {
    updateStatisticsView();
});

let frequencyMap = {};

function calculateFrequencies() {
    frequencyMap = {};
    // Iterate over all data graphs
    for (let i = 0; i < resultData.length; i++) {
        calculateFrequenciesNode(resultData[i].graph);
    }
}

function calculateFrequenciesNode(node) {
    if (!frequencyMap[node.nodeId]) {
        frequencyMap[node.nodeId] = 1;
    } else {
        frequencyMap[node.nodeId]++;
    }
    if (node.children != null && node.children != undefined && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
            calculateFrequenciesNode(node.children[i]);
        }
    } else if (node._children != null && node._children != undefined && node._children.length > 0) {
        // Collapsed
        for (let i = 0; i < node._children.length; i++) {
            calculateFrequenciesNode(node._children[i]);
        }
    }
}


let securityScoreMap = {};

function calculateSecurityScores() {
    securityScoreMap = {};
    // Iterate over all data graphs
    for (let i = 0; i < resultData.length; i++) {
        calculateScore(resultData[i].graph);
        calculateSecurityScoresNode(resultData[i].graph);
    }
}

function calculateSecurityScoresNode(node) {
    if (!securityScoreMap[node.nodeId]) {
        securityScoreMap[node.nodeId] = { n: 1, min: node.score, max: node.score, sum: node.score };
    } else {
        securityScoreMap[node.nodeId].n++;
        securityScoreMap[node.nodeId].sum += node.score;
        if (node.score < securityScoreMap[node.nodeId].min) {
            securityScoreMap[node.nodeId].min = node.score;
        }
        if (node.score > securityScoreMap[node.nodeId].max) {
            securityScoreMap[node.nodeId].max = node.score;
        }
    }
    if (node.children != null && node.children != undefined && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
            calculateSecurityScoresNode(node.children[i]);
        }
    } else if (node._children != null && node._children != undefined && node._children.length > 0) {
        // Collapsed
        for (let i = 0; i < node._children.length; i++) {
            calculateSecurityScoresNode(node._children[i]);
        }
    }
}

function downloadRecoveryScores() {

    let csvData = "id,recovery";

    let tmpRoot = root;
    let tmpDeviceData = deviceData;

    for (let i = 0; i < resultData.length; i++) {
        root = resultData[i].graph;
        if (resultData[i].devices) {
            deviceData = resultData[i].devices;
        } else {
            deviceData = [];
        }

        $("div#graphLabel").html("Data: " + resultData[i].id);

        update(root);
        // Call twice to get Ids
        update(root);

        csvData += "\n" + resultData[i].id + "," + (isNaN(resultData[i].graph.recovery) ? "" : resultData[i].graph.recovery);
    }
    showOriginalModel();

    var dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "recovery_results.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function downloadSecurityScores() {

    let csvData = "id,security_" + selectedNode.nodeId;

    for (let i = 0; i < resultData.length; i++) {
        let node = getNodebyNodeId(resultData[i].graph, selectedNode.nodeId);
        if (node !== null) {
            calculateScore(node);

            csvData += "\n" + resultData[i].id + "," + (isNaN(node.score) ? "" : node.score);
        } else {
            csvData += "\n" + resultData[i].id + ",";
        }
    }


    var dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "security_results.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

}

function graphPatternIsEqual(nodeIdsA, nodeIdsB) {
    // Compare length
    if (nodeIdsA.length === nodeIdsB.length) {
        for (let i = 0; i < nodeIdsA.length; i++) {
            // Compare nodeIds one by one
            if (nodeIdsA[i] != nodeIdsB[i]) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }

}


let patterns = [];

function getGraphPatterns() {
    if (resultData.length === 0)
        return;

    let nodeIdLists = [];
    // Obtain sorted list of node IDs for each data graph together with resultData array index
    for (let i = 0; i < resultData.length; i++) {
        nodeIdLists.push({ nodeIds: getGraphPatternsNode(resultData[i].graph).sort(), dataIndex: i });
    }

    // Determine how many of the graphs have a matching list of node IDs
    patterns = [];
    patternIndex = 0;
    let graph = null;
    while (nodeIdLists.length > 0) {
        // Next pattern

        patterns.push({ nodeIds: nodeIdLists[0].nodeIds, number: 1, dataIndices: [nodeIdLists[0].dataIndex] });

        nodeIdLists.splice(0, 1);

        let nodeIdListsIndex = 0;

        // Compare with all remaining nodes
        while (nodeIdListsIndex < nodeIdLists.length) {
            if (graphPatternIsEqual(patterns[patternIndex].nodeIds, nodeIdLists[nodeIdListsIndex].nodeIds)) {
                patterns[patternIndex].dataIndices.push(nodeIdLists[nodeIdListsIndex].dataIndex);
                patterns[patternIndex].number++;
                nodeIdLists.splice(nodeIdListsIndex, 1);
            } else {
                nodeIdListsIndex++;
            }
        }
        patternIndex++;
    }

    patterns.sort(function(a, b) {
        return b.number - a.number;
    });


    // Rank and display clickable list 
    let patternListHTML = "";
    for (let i = 0; i < patterns.length; i++) {
        patternListHTML += '<option  value="' + i + '"> Pattern ' + (i + 1) + " (n=" + patterns[i].number + ")" + '</option>';
    }
    $("select#formStatisticsPatternList").html(patternListHTML);
}

function getGraphPatternsNode(node) {
    let nodeIDs = [];
    nodeIDs.push(node.nodeId);
    if (node.children != null && node.children != undefined && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
            nodeIDs = nodeIDs.concat(getGraphPatternsNode(node.children[i]));
        }
    } else if (node._children != null && node._children != undefined && node._children.length > 0) {
        // Collapsed
        for (let i = 0; i < node._children.length; i++) {
            nodeIDs = nodeIDs.concat(getGraphPatternsNode(node._children[i]));
        }
    }
    return nodeIDs;
}

function showPatternGraph(index) {

    // Get graph from one of the resultData graphs


    let graph = patterns[index].graph;

    root = graph;
    deviceData = [];

    $("div#graphLabel").html("Pattern: " + (index + 1));

    update(root);
    // Call twice to get Ids
    update(root);
}

$("select#formStatisticsPatternList").change(function() {
    updateFormPatternSelection();
    updateFormStatisticsGraphSelection();
});

$("input#formStatisticsRecoveryMin").change(function() {
    updateFormRecoveryScores();
});
$("input#formStatisticsRecoveryMax").change(function() {
    updateFormRecoveryScores();
});

$("input#formStatisticsSecurityMin").change(function() {
    updateFormSecurityScores();
});
$("input#formStatisticsSecurityMax").change(function() {
    updateFormSecurityScores();
});

function updateFormRecoveryScores() {
    let minVal = $("input#formStatisticsRecoveryMin").val();
    let maxVal = $("input#formStatisticsRecoveryMax").val();

    let first = -1;
    let dataListHTML = "";
    let num = 0;
    // Include all data elements within the range
    for (let i = 0; i < resultData.length; i++) {
        root = resultData[i].graph;
        if (resultData[i].devices) {
            deviceData = resultData[i].devices;
        } else {
            deviceData = [];
        }

        update(root);
        // Call twice to get Ids
        update(root);
        let recovery = isNaN(resultData[i].graph.recovery) ? -1 : resultData[i].graph.recovery;
        if (recovery >= minVal && recovery <= maxVal) {
            num++;
            if (first == -1) {
                first = i;
            }
            dataListHTML += '<option  value="' + i + '">' + resultData[i].id + '</option>';
        }
    }
    $("select#formStatisticsDataList").html(dataListHTML);
    $("span#formStatisticsRecoveryOutputNumber").html(num);
    if (first > -1) {
        $("select#formDataList").val(first);
        resultDataSelected = first;
        showDataGraph();
    } else {
        showOriginalModel();
    }
}

function updateFormSecurityScores() {
    let minVal = $("input#formStatisticsSecurityMin").val();
    let maxVal = $("input#formStatisticsSecurityMax").val();

    let first = -1;
    let dataListHTML = "";
    let num = 0;
    // Include all data elements within the range
    for (let i = 0; i < resultData.length; i++) {

        calculateScore(resultData[i].graph);
        let securityScore = resultData[i].graph.score;
        if (securityScore >= minVal && securityScore <= maxVal) {
            num++;
            if (first == -1) {
                first = i;
            }
            dataListHTML += '<option  value="' + i + '">' + resultData[i].id + '</option>';
        }
    }
    $("select#formStatisticsDataList").html(dataListHTML);
    $("span#formStatisticsSecurityOutputNumber").html(num);
    if (first > -1) {
        $("select#formDataList").val(first);
        resultDataSelected = first;
        showDataGraph();
    } else {
        showOriginalModel();
    }
}

function updateFormPatternSelection() {
    let index = parseInt($("select#formStatisticsPatternList").val());
    let dataListHTML = "";
    for (let i = 0; i < patterns[index].dataIndices.length; i++) {
        dataListHTML += '<option  value="' + patterns[index].dataIndices[i] + '">' + resultData[patterns[index].dataIndices[i]].id + '</option>';
    }
    $("select#formStatisticsDataList").html(dataListHTML);
}

function updateFormStatisticsGraphSelection() {
    let index = parseInt($("select#formStatisticsDataList").val());
    $("select#formDataList").val(index);
    resultDataSelected = index;
    showDataGraph();
}

$("select#formStatisticsDataList").change(function() {
    updateFormStatisticsGraphSelection();
});