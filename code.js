// variables
const selection = figma.currentPage.selection;
var errorMsg, masterLocation, instanceLocation, instance, masterComponent;
var newSelection = [];
//validate and start plugin
if (validateSelection()) {
    editMasterInPlace();
}
else {
    figma.notify(errorMsg);
    figma.closePlugin();
}
//msgs from UI
figma.ui.onmessage = function (msg) {
    if (msg.done === true) {
        moveMasterBack();
        figma.closePlugin;
        return;
    }
};
// FUNCTIONS //////////
//initialize plugin
function editMasterInPlace() {
    //vars
    instance = selection[0];
    masterComponent = instance.masterComponent;
    let name = masterComponent.name;
    let instanceIndex = instance.parent.children.indexOf(instance);
    //override size of instances
    overrideSizeOfInstances(masterComponent.id);
    //display the UI
    figma.showUI(__html__, { width: 240, height: 112 });
    //send name of component to UI
    figma.ui.postMessage({
        'name': name
    });
    //gather info from master + instance
    masterLocation = getMCLocation(masterComponent);
    //hide the instance
    instance.visible = false;
    //move master
    instance.parent.insertChild(instanceIndex, masterComponent);
    masterComponent.x = instance.x;
    masterComponent.y = instance.y;
    masterComponent.resize(instance.width, instance.height);
    //update selection
    newSelection.push(masterComponent);
    figma.currentPage.selection = newSelection;
    //return;
}
//move the master back
function moveMasterBack() {
    masterLocation.parent.insertChild(masterLocation.index, masterComponent);
    masterComponent.x = masterLocation.x;
    masterComponent.y = masterLocation.y;
    masterComponent.resize(masterLocation.width, masterLocation.height);
    instance.visible = true;
    //update selection
    newSelection = [];
    newSelection.push(instance);
    figma.currentPage.selection = newSelection;
    figma.closePlugin();
    return;
}
// validate the selection
// selection can only contain a single instance
// instance must be local component
function validateSelection() {
    let length = false;
    let type = false;
    let local = false;
    let inst;
    //check length
    if (selection.length === 1) {
        length = true;
    }
    //check type
    if (selection[0].type === 'INSTANCE') {
        type = true;
        inst = selection[0];
    }
    //check if remote
    if (type) {
        if (inst.masterComponent.remote === false) {
            local = true;
        }
    }
    //put it all together
    if (length && type && local) {
        return true;
    }
    else {
        if (!length) {
            errorMsg = 'Please select a single instance';
            return false;
        }
        else if (!type) {
            errorMsg = 'Selection must be an instance.';
            return false;
        }
        else if (!local) {
            errorMsg = 'Instance is from a library. Please select a local component.';
            return false;
        }
    }
}
// creates an object that constains all the proprties to relocate master component
function getMCLocation(node) {
    return {
        'parent': node.parent,
        'index': node.parent.children.indexOf(node),
        'x': node.x,
        'y': node.y,
        'width': node.width,
        'height': node.height
    };
}
//override size of instances to be the same size.
function overrideSizeOfInstances(mcID) {
    let instances = figma.root.findAll(i => i.type === 'INSTANCE' && i.masterComponent.id === mcID);
    instances.forEach(instance => {
        let width = instance.width;
        let height = instance.height;
        instance.resize((width + 1), (height + 1));
        instance.resize(width, height);
    });
}
