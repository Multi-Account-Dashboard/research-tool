// View


$("input#formViewNodeWidth").val(document.Graph.settings.nodeWidth);
$("input#formViewNodeHeight").val(document.Graph.settings.nodeHeight);
$("input#formViewNodeHorizontalSpace").val(document.Graph.settings.horizontalSpace);
$("input#formViewNodeVerticalSpace").val(document.Graph.settings.verticalSpace);

$("input#formViewNodeWidth").change(function() {
    document.Graph.settings.nodeWidth = parseInt($("input#formViewNodeWidth").val());

    let tmp_root = root;
    let tmp_deviceData = deviceData;
    root = {};
    deviceData = [];
    update(root);

    root = tmp_root;
    deviceData = tmp_deviceData;
    update(root);
})

$("input#formViewNodeHeight").change(function() {
    document.Graph.settings.nodeHeight = parseInt($("input#formViewNodeHeight").val());
    refreshGraph();
})

$("input#formViewNodeHorizontalSpace").change(function() {
    document.Graph.settings.horizontalSpace = parseInt($("input#formViewNodeHorizontalSpace").val());
    refreshGraph();
})

$("input#formViewNodeVerticalSpace").change(function() {
    document.Graph.settings.verticalSpace = parseInt($("input#formViewNodeVerticalSpace").val());
    refreshGraph();
})

$("button#formViewResetButton").click(function() {
    document.Graph.settings.nodeWidth = 100;
    document.Graph.settings.nodeHeight = 30;
    document.Graph.settings.horizontalSpace = 30;
    document.Graph.settings.verticalSpace = 40;

    $("input#formViewNodeWidth").val(document.Graph.settings.nodeWidth);
    $("input#formViewNodeHeight").val(document.Graph.settings.nodeHeight);
    $("input#formViewNodeHorizontalSpace").val(document.Graph.settings.horizontalSpace);
    $("input#formViewNodeVerticalSpace").val(document.Graph.settings.verticalSpace);
    refreshGraph();
});

$("select#formViewShowScores").change(function() {
    console.log("test");
    document.Graph.settings.showScore = $("select#formViewShowScores").val();
    refreshGraph();
});

/*$("input#formViewShowDevices").change(function() {
    document.Graph.settings.showDevices = $("input#formViewShowDevices").prop("checked");
    refreshGraph();
});*/

$("select#formViewShowDevices").change(function() {
    document.Graph.settings.showDevices = $("select#formViewShowDevices").val();
    refreshGraph();
});