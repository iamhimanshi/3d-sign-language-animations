
let scene, camera, renderer;
let currentCharacter = null;
let characters = new Map(); 
const clock = new THREE.Clock();

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting Sign Language Interpreter...');
    init();
});

function init() {
    createScene();
    createLights();
    loadAllCharacters();
    setupEventListeners();
    animate();
    updateStatus('Loading characters...');
}

function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 3);
    camera.lookAt(0, 1, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);
    
    console.log('✅ Scene created');
}

function createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
}

function loadAllCharacters() {
    console.log('📥 Loading all characters with their animations...');
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
    script.onload = function() {
        console.log('✅ GLTFLoader loaded');
        
        const loader = new THREE.GLTFLoader();
        
      
        loadCharacter(loader, 'idle', 'model/idle.glb');
        loadCharacter(loader, 'hello', 'model/animations/hello.glb');
        loadCharacter(loader, 'thank_you', 'model/animations/thankyou.glb');
        loadCharacter(loader, 'bye', 'model/animations/bye.glb');

        loadCharacter(loader, 'good_evening', 'model/animations/good evening.glb');
        loadCharacter(loader, 'good_afternoon', 'model/animations/good afternoon.glb');
        loadCharacter(loader, 'good_morning', 'model/animations/good morning.glb');

    };
    document.head.appendChild(script);
}

function loadCharacter(loader, characterName, filePath) {
    console.log(`📥 Loading ${characterName} from ${filePath}`);
    
    loader.load(filePath, function(gltf) {
        console.log(`✅ ${characterName} loaded successfully`);
        
        const character = {
            scene: gltf.scene,
            mixer: null,
            animations: gltf.animations || [],
            action: null 
        };
        
        // Set up the character
        character.scene.scale.set(1, 1, 1);
        character.scene.position.set(0, 0, 0);
        character.scene.visible = false; // Hide initially
        
        // create animation mixer for 3d character
        if (character.animations.length > 0) {
            character.mixer = new THREE.AnimationMixer(character.scene);
            
           
            if (characterName === 'idle') {
                const clip = character.animations[1] || character.animations[0]; 
                character.action = character.mixer.clipAction(clip);
                character.action.setLoop(THREE.LoopRepeat);
                console.log(`🔄 ${characterName}: Idle animation ready`);
            } else {
                
                const clip = character.animations[0];
                character.action = character.mixer.clipAction(clip);
                character.action.setLoop(THREE.LoopOnce);
                character.action.clampWhenFinished = true;
                console.log(`🎬 ${characterName}: Animation ready to play`);
            }
        }
        
        // store the character
        characters.set(characterName, character);
        scene.add(character.scene);
        
        console.log(`✅ ${characterName} setup complete`);
        
        
        updateStatus(`Loaded: ${characterName}`);
        
        
        if (characters.size >= 4) {
            setTimeout(() => {
                document.body.classList.add('loaded');
                // show  idle animation as default
                showCharacter('idle');
                updateStatus('Ready! Click any button to sign');
                console.log('🎉 ALL CHARACTERS LOADED!', Array.from(characters.keys()));
            }, 1000);
        }
        
    }, 
    
    function(xhr) {
        console.log(`${characterName}: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`);
    },
    
    function(error) {
        console.error(`❌ Failed to load ${characterName}:`, error);
    });
}

function showCharacter(characterName) {
    console.log(`🎯 Showing character: ${characterName}`);
    
    
    characters.forEach((character, name) => {
        character.scene.visible = false;
      
        if (character.mixer && character.action) {
            character.action.stop();
        }
    });
    
    // show  requested animation
    const character = characters.get(characterName);
    if (character) {
        character.scene.visible = true;
        currentCharacter = characterName;
        
       
        if (character.mixer && character.action) {
            console.log(`🎬 Playing ${characterName} animation`);
            
            character.mixer.stopAllAction(); 
            
            if (characterName === 'idle') {
                // playing idle animation in loop
                character.action.setLoop(THREE.LoopRepeat);
                character.action.play();
                console.log(`🔄 ${characterName}: Playing idle animation (looping)`);
            } else {
                
                character.action.setLoop(THREE.LoopOnce);
                character.action.clampWhenFinished = true;
                character.action.play();
                console.log(`🎬 ${characterName}: Playing sign animation (once)`);
                
                // return to idle 
                const duration = character.action.getClip().duration * 1000;
                console.log(`⏰ Will return to idle in ${duration}ms`);
                
                setTimeout(() => {
                    if (currentCharacter === characterName) {
                        console.log('🔄 Animation finished, returning to idle');
                        showCharacter('idle');
                    }
                }, duration);
            }
        } else {
            console.warn(`⚠️ No animation found for ${characterName}`);
        }
    } else {
        console.error(`❌ Character "${characterName}" not found`);
    }
}

function updateStatus(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
    }
    console.log('📢 Status:', message);
}

function setupEventListeners() {
    // add new button listener here
    document.getElementById('btn-idle').addEventListener('click', () => {
        console.log('🎯 IDLE button clicked');
        showCharacter('idle');
    });
    
    document.getElementById('btn-hello').addEventListener('click', () => {
        console.log('🎯 HELLO button clicked');
        showCharacter('hello');
    });
    
    document.getElementById('btn-thank-you').addEventListener('click', () => {
        console.log('🎯 THANK YOU button clicked');
        showCharacter('thank_you');
    });
    
    document.getElementById('btn-bye').addEventListener('click', () => {
        console.log('🎯 BYE button clicked');
        showCharacter('bye');
    });

    document.getElementById('btn-good-evening').addEventListener('click', () => {
        console.log('🎯 GOOD EVENING button clicked');
        showCharacter('good_evening');
    });

    document.getElementById('btn-good-afternoon').addEventListener('click', () => {
        console.log('🎯 GOOD AFTERNOON button clicked');
        showCharacter('good_afternoon');
    });

    document.getElementById('btn-good-morning').addEventListener('click', () => {
        console.log('🎯 GOOD MORNING button clicked');
        showCharacter('good_morning');
    });


    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    
    characters.forEach((character) => {
        if (character.mixer) {
            character.mixer.update(delta);
        }
    });
    
    renderer.render(scene, camera);
}

            // debug
window.showCharacters = function() {
    console.log('🔍 LOADED CHARACTERS:', Array.from(characters.keys()));
    characters.forEach((character, name) => {
        console.log(`   ${name}: ${character.animations.length} animations`);
        character.animations.forEach((clip, index) => {
            console.log(`      ${index}: ${clip.name} (${clip.duration}s)`);
        });
    });
};

window.testCharacter = function(characterName) {
    console.log(`🧪 TESTING: ${characterName}`);
    showCharacter(characterName);
};

//   checking idle animation
window.checkIdle = function() {
    const idleChar = characters.get('idle');
    if (idleChar) {
        console.log('🔍 Idle Character Debug:');
        console.log('   - Visible:', idleChar.scene.visible);
        console.log('   - Animations:', idleChar.animations.length);
        console.log('   - Mixer:', idleChar.mixer);
        console.log('   - Action:', idleChar.action);
        console.log('   - Action Running:', idleChar.action ? idleChar.action.isRunning() : 'No action');
        
        if (idleChar.animations.length > 0) {
            console.log('   Available animations:');
            idleChar.animations.forEach((clip, index) => {
                console.log(`      ${index}: "${clip.name}" (${clip.duration}s)`);
            });
        }
    } else {
        console.log('❌ Idle character not found');
    }
};


setTimeout(() => {
    if (!document.body.classList.contains('loaded')) {
        console.log('🆘 EMERGENCY: Forcing loading screen to hide');
        document.body.classList.add('loaded');
        if (characters.size > 0) {
            showCharacter('idle');
        }
        updateStatus('System ready (some features may be limited)');
    }
}, 10000);

console.log('✨ Sign Language Interpreter Initialized');