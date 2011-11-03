/*
 * JavaScript to render a SpaceTree for the project tree
 */

// the SpaceTree instance
var st;
// whether or not a node is currently in editing mode, for editing a node's name
var inEditing = false;

var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text) {
    if (!this.elem)
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};

// returns a node's parent node
function getParentNode( selectedNode ) {
  if( selectedNode.id !== st.root ) { // if the node isn't the root node
    // an array of the node's parents
    var parents = selectedNode.getParents();
    // the number of parents the node has
    var numParents = parents.length;
    // returns the node's parent, which is the last parent in the array
    return parents[numParents-1];
  }
};

// returns the requested information a node, depending on current node's depth
function getNodeInfo( selectedNode, info, parent_id ) {
  // object category is the current (last clicked) node
  if( (selectedNode.id === st.root) || (selectedNode._depth % 2 === 0) ) {  // if current node is at node depth 0 (root), 2, or 4, etc.
    if( info === "resource" ) {
      return "object_categories";
    }
    else if( info === "child resource" ) {
      return "known_objects";
    }
    else if( info === "child resource name" ) {
      return "Object";
    }
    else if( info === "post child data" ) {
      return { "known_object":{ "name":"New Object", "object_category_id":selectedNode.id } };
    }
    else if( info === "put data" ) {
      return { "object_category":{ "name":jQuery("input").val() } };
    }
  }

  // object is the current (last clicked) node
  else if( selectedNode._depth % 2 === 1 ) {  // if current node is at node depth 1, 3, or 5, etc.
    if( info === "resource" ) {
      return "known_objects";
    }
    else if( info === "resource name" ) {
      return "Object";
    }
    else if( info === "parent resource" ) {
      return "object_categories";
    }
    else if( info === "post sibling data" ) {
      return { "known_object":{ "name":"New Object", "object_category_id":parent_id } };
    }
    else if( info === "put data" ) {
      return { "known_object":{ "name":jQuery("input").val() } };
    }
    else if( info === "delete data" ) {
      return { "known_object":{ "deleted":true } };
    }
  }
};

// REST: creates child node in database and JIT tree
function createChildNode( selectedNode ) {
  // the current (last clicked) node's child's resource
  var child_resource = getNodeInfo( selectedNode, "child resource" );
  // the data to be set when creating a child node to the current (last clicked) node; since the resource key cannot be a variable because it's taken literally, the entire data is set
  var postData = getNodeInfo( selectedNode, "post child data" );

  // creates object in database
  jQuery.ajax( {
    type: "POST",
    url: "/"+child_resource+".json",  // need JSON to retrieve created node's data
    data: postData,
    success: function( newNodeJSON ) {

      // the current (last clicked) node's child's resource name
      var newNodeName = "New " + getNodeInfo( selectedNode, "child resource name" );

      // the new child node that's added
      var newNode = {
        id: selectedNode.id, // parent of new node (i.e. node being added to)
        children: [{
          id: newNodeJSON.id,
          name: newNodeName,
          data: {},
          children: []
        }]
      };
      // adds a child node to the current (last clicked) node
      Log.write( "adding node..." );
      st.addSubtree( newNode, "replot", {
        hideLabels: false,
        onComplete: function() {
          Log.write( "node added" );
        }
      });

      // selects the new node (highlights and centers the tree), as if it were clicked
      st.onClick( newNodeJSON.id );

      // changes text to an input field with a value of the node's current name
      jQuery("#"+newNodeJSON.id).html('<input type="text" value="'+newNodeName+'" />');
      // highlights text in input field
      jQuery("input").select();

    }
  });
};

// REST: creates sibling node in database and JIT tree
function createSiblingNode( selectedNode ) {
  // the current (last clicked) node's parent's JSON ID
  var parent_id = getParentNode( st.clickedNode ).id;

  // the current (last clicked) node's sibling's resource, which is the same as the current node's
  var sibling_resource = getNodeInfo( selectedNode, "resource" );
  // the data to be set when creating a child node to the current (last clicked) node; since the resource key cannot be a variable because it's taken literally, the entire data is set
  var postData = getNodeInfo( selectedNode, "post sibling data", parent_id.slice(0,-4) );

  // creates object in database
  jQuery.ajax( {
    type: "POST",
    url: "/"+sibling_resource+".json",  // need JSON to retrieve created node's data
    data: postData,
    success: function( newNodeJSON ) {

      // the current (last clicked) node's sibling's resource name, which is the same as the current node's
      var newNodeName = "New " + getNodeInfo( selectedNode, "resource name" );

      // the new child node that's added
      var newNode = {
        id: parent_id, // parent of new node (i.e. node being added to)
        children: [{
          id: newNodeJSON.id,
          name: newNodeName,
          data: {},
          children: []
        }]
      };
      // adds a child node to the current (last clicked) node
      Log.write( "adding node..." );
      st.addSubtree( newNode, "replot", {
        hideLabels: false,
        onComplete: function() {
          Log.write( "node added" );
        }
      });

      // selects the new node (highlights and centers the tree), as if it were clicked
      st.onClick( newNodeJSON.id );

      // changes text to an input field with a value of the node's current name
      jQuery("#"+newNodeJSON.id).html('<input type="text" value="'+newNodeName+'" />');
      // highlights text in input field
      jQuery("input").select();

    }
  });
};

// REST: updates node name in database and JIT tree
function updateNode( selectedNode ) {
  // the current (last clicked) node's resource
  var resource = getNodeInfo( selectedNode, "resource" );
  // the current (last clicked) node's ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
  var resource_id = selectedNode.id.slice(0,-4);
  // the data to be set when updating the current (last clicked) node; since the resource key cannot be a variable because it's taken literally, the entire data is set
  var putData = getNodeInfo( selectedNode, "put data" );

  // updates name in database
  jQuery.ajax( {
    type: "PUT",
    url: "/"+resource+"/"+resource_id,
    data: putData,
    success: function() {

      // changes node's current name to the new name, which is the value of the input field in the node
      jQuery("#"+selectedNode.id).text(jQuery("input").val());

    }
  });
};

// REST: soft-deletes node in database and JIT tree
function deleteNode( selectedNode ) {
  // the current (last clicked) node's resource
  var resource = getNodeInfo( selectedNode, "resource" );
  // the current (last clicked) node's ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
  var resource_id = selectedNode.id.slice(0,-4);
  // the data to be set when updating the current (last clicked) node; since the resource key cannot be a variable because it's taken literally, the entire data is set
  var deleteData = getNodeInfo( selectedNode, "delete data" );

  // soft-deletes node in database by setting the "deleted" column in the resource's table to false
  jQuery.ajax( {
    type: "PUT",
    url: "/"+resource+"/"+resource_id,
    data: deleteData,
    success: function() {

      // deletes the current (last clicked) node (and its children if it has them)
      Log.write( "removing subtree..." );
      st.removeSubtree( selectedNode.id, true, 'animate', { // 'replot' doesn't seem to work, but duration is already set to 0 to disable animations
        hideLabels: false,
        onComplete: function() {
          Log.write( "subtree removed" );
        }
      });

      // the current (last clicked) node's parent's JSON ID
      var parent_JSONid = getParentNode( st.clickedNode ).id;
      // selects the deleted node's parent (highlights and centers the tree), as if it were clicked
      st.onClick( parent_JSONid );

    }
  });
};

// handles key presses
jQuery(document).keydown( function( event ) {
  if( window.event ) {  // for IE compatibility
    var keyCode = window.event.keyCode;
  }
  else {
    var keyCode = event.which;
  }
  switch( keyCode ) {

    // adding child node with Tab or Insert
    case 9: // Tab key
    case 45:  // Insert key
      // prevent default action of the event from happening (i.e. prevent Tab from moving focus)
      event.preventDefault();
if( st.clickedNode._depth < 1 ) { // REMOVE CHECK WHEN IN DESIGNPAD; this check's here since an object can't be the parent of an object category (no recursion)
    // only allow adding of a node if another node is not in editing mode
    if( !inEditing ) {
      // creates child node to the current (last clicked) node
      createChildNode( st.clickedNode );
      // node is now in editing mode
      inEditing = true;
    }
}
      break;

    // adding sibling node with Enter, or updating entered node name
    case 13: // Enter key
      // adding sibling node with Enter
      // only allow adding of a node if another node is not in editing mode
      if( !inEditing ) {
        // only allow the sibling node to be added if the current (last clicked) node is not the base FSD node, which is the root node
        if( st.clickedNode.id !== st.root ) {
          // creates sibling node to the current (last clicked) node
          createSiblingNode( st.clickedNode );
          // node is now in editing mode
          inEditing = true;
        }
        // warns the user that s/he cannot add another base FSD node
        else {
          alert( "You may only have one base function structure diagram!" );
        }
      }
      // updating entered node name
      else {
        // updates the current (last clicked) node's name
        updateNode( st.clickedNode );
        // done editing
        inEditing = false;
      }
      break;

    // enabling editing node name with F2
    case 113: // F2 key
      // only allow editing of a node if it's not already in editing mode
      if( !inEditing ) {
        // the current (last clicked) node's resource
        var resource = getNodeInfo( st.clickedNode, "resource" );
        // the current (last clicked) node's ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
        var resource_id = st.clickedNode.id.slice(0,-4);

        // gets current (last clicked) node's data
        jQuery.ajax( {
          type: "GET",
          url: "/"+resource+"/"+resource_id+".json",  // need JSON to retrieve created node's data
          success: function( currNode ) {

            // changes text to an input field with a value of the node's current name
            jQuery("#"+currNode.id).html('<input type="text" value="'+currNode.name+'" />');
            // highlights text in input field
            jQuery("input").select();
            // node is now in editing mode
            inEditing = true;

          }
        });
      }
      break;

    // deleting node (and its children if it has them) with Backspace or Delete
    case 8: // Backspace key
    case 46:  // Delete key
      // only allow deleting of a node if another node is not in editing mode
      if( !inEditing ) {
        // prevent default action of the event from happening only if a node is not in editing mode (i.e. prevent Backspace from going back a page when a node's not in editing mode, but still allow Backspace and Delete when typing new node name in its editing mode since it's an input field)
        event.preventDefault();

        // only allow the current (last clicked) node (and its children if it has them) to be deleted if it's not the base FSD node, which is the root node
        if( st.clickedNode.id !== st.root ) {
          if( st.clickedNode.anySubnode("exist") ) {  // if the current (last clicked) node has any children (NOTE: NOT SOFT-DELETING CHILDREN)
            if( confirm("Are you sure you would like to delete \""+st.clickedNode.name+"\" and its sub-node(s)?") ) { // confirms if the user wants to delete the current (last clicked) node
              // soft-deletes the current (last clicked) node
              deleteNode( st.clickedNode );
            }
          }
          else {
            // soft-deletes the current (last clicked) node
            deleteNode( st.clickedNode );
          }
        }
        // warns the user that s/he cannot delete the base FSD node
        else {
          alert( "You may not delete the base function structure diagram!" );
        }
      }
      break;

    // navigating left, to parent node, with Arrow Left
    case 37:  // Arrow Left key
    // only allow navigation if a node's not in editing mode
      if( !inEditing ) {
        // the current (last clicked) node's parent's JSON ID
        var parent_JSONid = getParentNode( st.clickedNode ).id;

        if( st.clickedNode.id !== st.root ) { // if it's not the root node
          // selects parent
          st.onClick( parent_JSONid );
        }
      }
      break;

    // navigating right, to first child node, with Arrow Right
    case 39:  // Arrow Right key
    // only allow navigation if a node's not in editing mode
      if( !inEditing ) {
        if( st.clickedNode.anySubnode("exist") ) {  // if it has any children
          // selects first child
          st.onClick( st.clickedNode.getSubnodes()[1].id );
        }
      }
      break;

    // navigating up depth with Arrow Up
    case 38:  // Arrow Up key
    // only allow navigation if a node's not in editing mode
      if( !inEditing ) {
        // the current (last clicked) node's parent's resource
        var parent_resource = getNodeInfo( st.clickedNode, "parent resource" );
        // the current (last clicked) node's parent's ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
        var parent_id = getParentNode( st.clickedNode ).id.slice(0,-4);
        // the current (last clicked) node's parent
        var parentNode = getParentNode( st.clickedNode );

        // gets current (last clicked) node's parent's data
        jQuery.ajax( {
          type: "GET",
          url: "/"+parent_resource+"/"+parent_id+".json",  // need JSON to retrieve created node's data
          success: function( parentJSON ) {
            // iterates through JSON's direct children
            jQuery.each( parentJSON.children, function( i, v ) {
              if( v.id === st.clickedNode.id ) {  // if the child's JSON ID matches the current (last clicked) node's JSON ID
                if( i > 0 ) { // ensure the child isn't the 1st one (0-based indexing)
                  // selects the current (last clicked) node's previous sibling, which is its parent's i-th child (1-based indexing with current node as (i+1)-th child)
                  st.onClick( parentNode.getSubnodes()[i].id );
                  return;
                }
                else {
                  // don't do anything if it's already the first child
                  return;
                }
              }
            });
          }
        });
      }
      break;

    // navigating down depth with Arrow Down
    case 40:  // Arrow Down key
      // only allow navigation if a node's not in editing mode
      if( !inEditing ) {
        // the current (last clicked) node's parent's resource
        var parent_resource = getNodeInfo( st.clickedNode, "parent resource" );
        // the current (last clicked) node's parent's ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
        var parent_id = getParentNode( st.clickedNode ).id.slice(0,-4);
        // the current (last clicked) node's parent
        var parentNode = getParentNode( st.clickedNode );

        // counts current (last clicked) node's parent's children number (1-based "indexing")
        var count = 0;
        parentNode.eachSubnode( function(n) {
          count++;
        });

        // gets current (last clicked) node's parent's data
        jQuery.ajax( {
          type: "GET",
          url: "/"+parent_resource+"/"+parent_id+".json",  // need JSON to retrieve created node's data
          success: function( parentJSON ) {
            // iterates through JSON's direct children
            jQuery.each( parentJSON.children, function( i, v ) {
              if( v.id === st.clickedNode.id ) {  // if the child's JSON ID matches the current (last clicked) node's JSON ID
                if( i+1 < count ) { // ensure the child isn't the last one (0-based indexing)
                  // selects the current (last clicked) node's next sibling, which is its parent's (i+2)-th child (1-based indexing with current node as (i+1)-th child)
                  st.onClick( parentNode.getSubnodes()[i+2].id );
                  return;
                }
                else {
                  // don't do anything if it's already the first child
                  return;
                }
              }
            });
          }
        });
      }
      break;

  }
});

// renders the JIT tree with the JSON representation as a parameter
//init data
function init( fsdJSON ) {

  // assign a variable, with the value of the JSON representation, to be used when rendering the JIT tree
  var treeJSON = fsdJSON;

  //init Spacetree
  //Create a new ST instance
  st = new $jit.ST({
    //id of viz container element
    injectInto: 'infovis',
    //set duration for the animation
    duration: 0,  // 0 to disable animations
    //set animation transition type
    transition: $jit.Trans.Quart.easeInOut,
    //set distance between node and its children
    levelDistance: 50,
    //enable panning
    Navigation: {
      enable:true,
      panning:true
    },
    //set node and edge styles
    //set overridable=true for styling individual
    //nodes or edges
    Node: {
      height: 20,
      width: 60,
      type: 'rectangle',
      color: '#aaa',
      overridable: true
    },
    Edge: {
      type: 'bezier',
      overridable: true
    },
    onBeforeCompute: function(node) {
      Log.write("loading " + node.name);
    },
    onAfterCompute: function() {
      Log.write("done");
    },
    //This method is called on DOM label creation.
    //Use this method to add event handlers and styles to
    //your node.
    onCreateLabel: function(label, node) {
      label.id = node.id;
      label.innerHTML = node.name;
      label.onclick = function() {
        st.onClick(node.id);
      };
      //set label styles
      var style = label.style;
      style.width = 60 + 'px';
      style.height = 17 + 'px';
      style.cursor = 'pointer';
      style.color = '#333';
      style.fontSize = '0.8em';
      style.textAlign= 'center';
      style.paddingTop = '1px';
    },
    //This method is called right before plotting
    //a node. It's useful for changing an individual node
    //style properties before plotting it.
    //The data properties prefixed with a dollar
    //sign will override the global node style properties.
    onBeforePlotNode: function(node) {
      //add some color to the nodes in the path between the
      //root node and the selected node.
      if (node.selected) {
        if( node.id === st.clickedNode.id ) { // if it's the current (last clicked) node (= last node in path)
          node.data.$color = "#f77";  // red
        }
        else {
          node.data.$color = "#ff7";
        }
      }
      else {
        delete node.data.$color;
        //if the node belongs to the last plotted level
        if(!node.anySubnode("exist")) {
          //count children number
          var count = 0;
          node.eachSubnode(function(n) { count++; });
          //assign a node color based on
          //how many children it has
          node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
        }
      }
    },
    //This method is called right before plotting
    //an edge. It's useful for changing an individual edge
    //style properties before plotting it.
    //Edge data proprties prefixed with a dollar sign will
    //override the Edge global style properties.
    onBeforePlotLine: function(adj) {
      if (adj.nodeFrom.selected && adj.nodeTo.selected) {
        adj.data.$color = "#eed";
        adj.data.$lineWidth = 3;
      }
      else {
        delete adj.data.$color;
        delete adj.data.$lineWidth;
      }
    },
    Events: {
      enable: true,
      // handles right click that enables editing a node name
      onRightClick: function( node, eventInfo, e ) {
        // only allow editing of a node if it's not already in editing mode
        if( !inEditing ) {
          if( node ) {  // if a node, and not empty space, is right clicked
            if( node.id === st.clickedNode.id ) {  // if the node is the current (last clicked) node (i.e. the one that is going to be edited)
              // the current (last clicked) node's resource
              var resource = getNodeInfo( st.clickedNode, "resource" );
              // the current (last clicked) node's ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
              var resource_id = st.clickedNode.id.slice(0,-4);

              // gets current (last clicked) node's data
              jQuery.ajax( {
                type: "GET",
                url: "/"+resource+"/"+resource_id+".json",  // need JSON to retrieve created node's data
                success: function( currNode ) {

                  // changes text to an input field with a value of the node's current name - need to get it from database because names aren't actually saved in the JIT tree ("text" just replaces it)
                  jQuery("#"+currNode.id).html('<input type="text" value="'+currNode.name+'" />');
                  // highlights text in input field
                  jQuery("input").select();
                  // node is now in editing mode
                  inEditing = true;

                }
              });
            }
          }
        }
      },
      // handles click that saves node name, for if the user edits a node's name but clicks elsewhere instead of pressing Enter to save
      onClick: function( node, eventInfo, e ) {
        if( inEditing ) { // if a node is in editing mode
          if( node.id !== st.clickedNode.id ) {  // if user clicks anywhere except for the current (last clicked) node
            // updates the current (last clicked) node's name
            updateNode( st.clickedNode );
            // done editing
            inEditing = false;
          }
        }
      }
    }
  });

  //load json data
  st.loadJSON(treeJSON);
  //compute node positions and layout
  st.compute();
  //optional: make a translation of the tree
  st.geom.translate(new $jit.Complex(-200, 0), "current");
  //emulate a click on the root node.
  st.onClick(st.root);

  //handle spacetree orientation
  var normal = $jit.id('s-normal');

}
