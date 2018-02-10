let Boid = function() {
  var vector = new THREE.Vector3(),
  _acceleration, _width = 500, _height = 500, _depth = 200, _goal, _neighborhoodRadius = 100,
  _maxSpeed = 4, _maxSteerForce = 0.1, _avoidWalls = false;
  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  _acceleration = new THREE.Vector3();
  this.setGoal = function ( target ) {
    _goal = target;
  };
  this.setAvoidWalls = function ( value ) {
    _avoidWalls = value;
  };
  this.setWorldSize = function ( width, height, depth ) {
    _width = width;
    _height = height;
    _depth = depth;
  };
  this.run = function ( boids ) {
    if ( _avoidWalls ) {
      vector.set( - _width, this.position.y, this.position.z );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( _width, this.position.y, this.position.z );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( this.position.x, - _height, this.position.z );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( this.position.x, _height, this.position.z );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( this.position.x, this.position.y, - _depth );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( this.position.x, this.position.y, _depth );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );
    }/* else {
      this.checkBounds();
    }
    */
    if ( Math.random() > 0.5 ) {
      this.flock( boids );
    }
    this.move();
  };
  this.flock = function ( boids ) {
    if ( _goal ) {
      _acceleration.add( this.reach( _goal, 0.005 ) );
    }
    _acceleration.add( this.alignment( boids ) );
    _acceleration.add( this.cohesion( boids ) );
    _acceleration.add( this.separation( boids ) );
  };
  this.move = function () {
    this.velocity.add( _acceleration );
    var l = this.velocity.length();
    if ( l > _maxSpeed ) {
      this.velocity.divideScalar( l / _maxSpeed );
    }
    this.position.add( this.velocity );
    _acceleration.set( 0, 0, 0 );
  };
  this.checkBounds = function () {
    if ( this.position.x >   _width ) this.position.x = - _width;
    if ( this.position.x < - _width ) this.position.x =   _width;
    if ( this.position.y >   _height ) this.position.y = - _height;
    if ( this.position.y < - _height ) this.position.y =  _height;
    if ( this.position.z >  _depth ) this.position.z = - _depth;
    if ( this.position.z < - _depth ) this.position.z =  _depth;
  };
  //
  this.avoid = function ( target ) {
    var steer = new THREE.Vector3();
    steer.copy( this.position );
    steer.sub( target );
    steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );
    return steer;
  };
  this.repulse = function ( target ) {
    var distance = this.position.distanceTo( target );
    if ( distance < 150 ) {
      var steer = new THREE.Vector3();
      steer.subVectors( this.position, target );
      steer.multiplyScalar( 0.5 / distance );
      _acceleration.add( steer );
    }
  };
  this.reach = function ( target, amount ) {
    var steer = new THREE.Vector3();
    steer.subVectors( target, this.position );
    steer.multiplyScalar( amount );
    return steer;
  };
  this.alignment = function ( boids ) {
    var count = 0;
    var velSum = new THREE.Vector3();
    for ( var i = 0, il = boids.length; i < il; i++ ) {
      if ( Math.random() > 0.6 ) continue;
      var boid = boids[ i ];
      var distance = boid.position.distanceTo( this.position );
      if ( distance > 0 && distance <= _neighborhoodRadius ) {
        velSum.add( boid.velocity );
        count++;
      }
    }
    if ( count > 0 ) {
      velSum.divideScalar( count );
      var l = velSum.length();
      if ( l > _maxSteerForce ) {
        velSum.divideScalar( l / _maxSteerForce );
      }
    }
    return velSum;
  };
  this.cohesion = function ( boids ) {
    var count = 0;
    var posSum = new THREE.Vector3();
    var steer = new THREE.Vector3();
    for ( var i = 0, il = boids.length; i < il; i ++ ) {
      if ( Math.random() > 0.6 ) continue;
      var boid = boids[ i ];
      var distance = boid.position.distanceTo( this.position );
      if ( distance > 0 && distance <= _neighborhoodRadius ) {
        posSum.add( boid.position );
        count++;
      }
    }
    if ( count > 0 ) {
      posSum.divideScalar( count );
    }
    steer.subVectors( posSum, this.position );
    var l = steer.length();
    if ( l > _maxSteerForce ) {
      steer.divideScalar( l / _maxSteerForce );
    }
    return steer;
  };
  this.separation = function ( boids ) {
    var posSum = new THREE.Vector3();
    var repulse = new THREE.Vector3();
    for ( var i = 0, il = boids.length; i < il; i ++ ) {
      if ( Math.random() > 0.6 ) continue;
      var boid = boids[ i ];
      var distance = boid.position.distanceTo( this.position );
      if ( distance > 0 && distance <= _neighborhoodRadius ) {
        repulse.subVectors( this.position, boid.position );
        repulse.normalize();
        repulse.divideScalar( distance );
        posSum.add( repulse );
      }
    }
    return posSum;
  }
}

let SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,
SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;
let camera, scene, renderer;
let birds, bird, boid, boids;

let texture_placeholder,
isUserInteracting = false,
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
onMouseDownLon = 0, onMouseDownLat = 0,
lon = 90, lat = 0,
phi = 0, theta = 0,
target = new THREE.Vector3();

(function init() {
  camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
  scene = new THREE.Scene();
  renderer = new THREE.CanvasRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
  $('#container' ).append( renderer.domElement );

  birds = [];
  boids = [];
  for ( let i = 0; i < 200; i ++ ) {
    boid = boids[ i ] = new Boid();
    boid.position.x = Math.random() * 500-250;
    boid.position.y = Math.random() * 500-250;
    boid.position.z = Math.random() * 500-250;
    boid.velocity.x = Math.random() * 2 - 1;
    boid.velocity.y = Math.random() * 2 - 1;
    boid.velocity.z = Math.random() * 2 - 1;
    boid.setAvoidWalls( true );
    boid.setWorldSize( 500, 500, 500 );
    bird = birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color:0x000000, side: THREE.DoubleSide } ) );
    bird.phase = Math.floor( Math.random() * 62.83 );
    scene.add( bird );
  }

  const loadTexture=(path) => {
    let texture = new THREE.Texture( renderer.domElement );
    let material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
    let image = new Image();
    image.onload = function () {
      texture.image = this;
      texture.needsUpdate = true;
    };
    image.src = path;
    return material;
  };
  let mesh = new THREE.Mesh( new THREE.BoxGeometry( 1000, 1000, 1000, 7, 7, 7 ),  [
    loadTexture( 'res/skybox/1.jpg' ), // right
    loadTexture( 'res/skybox/2.jpg' ), // left
    loadTexture( 'res/skybox/3.jpg' ), // top
    loadTexture( 'res/skybox/4.jpg' ), // bottom
    loadTexture( 'res/skybox/5.jpg' ), // back
    loadTexture( 'res/skybox/6.jpg' )  // front
  ]);
  mesh.scale.x = - 1;
  scene.add( mesh );

  document.addEventListener( 'mousedown', (event)=>{
    if($('#content_wrapper').has(event.target).length==0){
      event.preventDefault();
      isUserInteracting = true;
      onPointerDownPointerX = event.clientX;
      onPointerDownPointerY = event.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
    }
  }, false );
  document.addEventListener( 'mousemove', (event)=>{
    if ( isUserInteracting === true ) {
      lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
      lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
    }
    // birds
    let vector = new THREE.Vector3( event.clientX - SCREEN_WIDTH_HALF, - event.clientY + SCREEN_HEIGHT_HALF, 0 );
    for ( let i = 0, il = boids.length; i < il; i++ ) {
      boid = boids[ i ];
      vector.z = boid.position.z;
      boid.repulse( vector );
    }
  }, false );
  document.addEventListener( 'mouseup', (event)=>{
    isUserInteracting = false;
  }, false );
  document.addEventListener( 'touchstart', (event)=>{
    if ( event.touches.length == 1 ) {
      event.preventDefault();
      onPointerDownPointerX = event.touches[ 0 ].pageX;
      onPointerDownPointerY = event.touches[ 0 ].pageY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
    }
  }, false );
  document.addEventListener( 'touchmove', (event)=>{
    if ( event.touches.length == 1 ) {
      event.preventDefault();
      lon = ( onPointerDownPointerX - event.touches[0].pageX ) * 0.1 + onPointerDownLon;
      lat = ( event.touches[0].pageY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
    }
  }, false );
  window.addEventListener( 'resize', ()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }, false );
})();
(function render() {
  if ( isUserInteracting === false ) {
    lon += 0.1;
  }
  lat = Math.max( - 85, Math.min( 85, lat ) );
  phi = THREE.Math.degToRad( 90 - lat );
  theta = THREE.Math.degToRad( lon );
  target.set(500 * Math.sin( phi ) * Math.cos( theta ), 500 * Math.cos( phi ), 500 * Math.sin( phi ) * Math.sin( theta ));
  camera.lookAt( target );

  for ( let i = 0, il = birds.length; i < il; i++ ) {
    boid = boids[ i ];
    boid.run( boids );

    bird = birds[ i ];
    bird.position.copy( boids[ i ].position );

    let color = bird.material.color;
    color.r = color.g = color.b = ( 500 - bird.position.z ) / 1000;

    bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
    bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

    bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
    bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = Math.sin( bird.phase ) * 5;
  }

  requestAnimationFrame( render );
  renderer.render( scene, camera );
})();
