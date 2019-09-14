// variables
const selection = figma.currentPage.selection;
var errorMsg, masterLocation, instanceLocation, instance, masterComponent;

//validate and start plugin
if (validateSelection()) {
	editMasterInPlace();
} else {
	figma.notify(errorMsg);
	figma.closePlugin();
}

//msgs from UI
figma.ui.onmessage = function (msg) {

	if(msg.done === true) {
		moveMasterBack();
		figma.closePlugin;
		return;
	}

}



// FUNCTIONS //////////

//initialize plugin
function editMasterInPlace() {
	//vars
	instance = selection[0] as InstanceNode;
	masterComponent = instance.masterComponent;
	
	let name = masterComponent.name;
	let instanceIndex = instance.parent.children.indexOf(instance);
	
	//display the UI
	figma.showUI(__html__, { width: 240, height: 112 });

	//send name of component to UI
	figma.ui.postMessage({
		'name': name
	});

	//gather info from master + instance
	masterLocation = getMCLocation(masterComponent);

	//hide the instance
	instance.visible =  false;

	//move master
	instance.parent.insertChild(instanceIndex, masterComponent);
	masterComponent.x = instance.x;
	masterComponent.y = instance.y;

	return;

}

//move the master back
function moveMasterBack() {

	masterLocation.parent.insertChild(masterLocation.index, masterComponent);
	masterComponent.x = masterLocation.x;
	masterComponent.y = masterLocation.y;

	instance.visible = true;

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
		inst = selection[0] as InstanceNode;
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
	} else {
		if (!length) {
			errorMsg = 'Please select a single instance';
			return false;
		} else if (!type) {
			errorMsg = 'Selection must be an instance.';
			return false;
		} else if (!local) {
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
		'y': node.y
	}
}
