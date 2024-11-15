import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Import du GLTFLoader

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let structure_model; // Déclaration globale pour la structure
let chariot1_model, chariot2_model; // Variables globales pour les modèles de chariots
let chariot1Tooltip = document.createElement("div");
chariot1Tooltip.classList.add("tooltip");
chariot1Tooltip.style.display = "none";
document.body.appendChild(chariot1Tooltip);

let chariot2Tooltip = document.createElement("div");
chariot2Tooltip.classList.add("tooltip");
chariot2Tooltip.style.display = "none";
document.body.appendChild(chariot2Tooltip);


// Fetch the canvas element created in index.html
const canvas = document.getElementById('canvas');

// Create a WebGLRenderer and set its width and height
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, canvas);
camera.position.set(4.18, 15, 30);
camera.lookAt(new THREE.Vector3(4.18, 15, 0));

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});

// PARQUET
const parquetGeometry = new THREE.BoxGeometry(100, 1, 40);
const parquetTexture = new THREE.TextureLoader().load("assets/sol.png");
const parquetMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: parquetTexture
});
const parquet = new THREE.Mesh(parquetGeometry, parquetMaterial);
parquet.position.set(4.5, -0.8, 15.5);
scene.add(parquet);

// MURS
const mur1Geometry = new THREE.BoxGeometry(100, 1, 30.5);
const mur1Texture = new THREE.TextureLoader().load("assets/fond2.png");
const mur1Material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: mur1Texture
});
const mur1 = new THREE.Mesh(mur1Geometry, mur1Material);
mur1.position.set(4.18, 15, -4);
mur1.rotation.x = -Math.PI / 2;
scene.add(mur1);

var uniforms = {
    iResolution: { value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1) },
    iTime: { value: 0.0 },
    greenFactor: { value: 1 }, // Facteur pour la couleur verte
    redFactor: { value: 0.8 },   // Facteur pour la couleur rouge
    blueFactor: { value: 0.4 }   // Facteur pour la couleur bleue
};

function fragmentShader() {
    return `
    uniform vec3 iResolution;
    uniform float iTime;
    uniform float greenFactor;
    uniform float redFactor;
    uniform float blueFactor;
    varying vec2 vUv;

    // Vos fonctions GLSL (colormap, noise, fbm, etc.) ici
    float colormap_red(float x) {
        if (x < 0.0) {
            return 54.0 / 255.0;
        } else if (x < 20049.0 / 82979.0) {
            return (829.79 * x + 54.51) / 255.0;
        } else {
            return 1.0;
        }
    }

    float colormap_green(float x) {
        if (x < 20049.0 / 82979.0) {
            return 0.0;
        } else if (x < 327013.0 / 810990.0) {
            return (8546482679670.0 / 10875673217.0 * x - 2064961390770.0 / 10875673217.0) / 255.0;
        } else if (x <= 1.0) {
            return (103806720.0 / 483977.0 * x + 19607415.0 / 483977.0) / 255.0;
        } else {
            return 1.0;
        }
    }

    float colormap_blue(float x) {
        if (x < 0.0) {
            return 54.0 / 255.0;
        } else if (x < 7249.0 / 82979.0) {
            return (829.79 * x + 54.51) / 255.0;
        } else if (x < 20049.0 / 82979.0) {
            return 127.0 / 255.0;
        } else if (x < 327013.0 / 810990.0) {
            return (792.02249341361393720147485376583 * x - 64.364790735602331034989206222672) / 255.0;
        } else {
            return 1.0;
        }
    }

    vec4 colormap(float x) {
        return vec4(greenFactor*colormap_green(x), redFactor * colormap_red(x), blueFactor * colormap_blue(x), 1.0);
    }

    float rand(vec2 n) { 
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }

    float noise(vec2 p){
        vec2 ip = floor(p);
        vec2 u = fract(p);
        u = u*u*(3.0-2.0*u);

        float res = mix(
            mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
            mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
        return res*res;
    }

    const mat2 mtx = mat2( 0.80,  0.60, -0.60,  0.80 );

    float fbm( vec2 p ) {
        float f = 0.0;

        f += 0.500000*noise( p + iTime  ); p = mtx*p*2.02;
        f += 0.031250*noise( p ); p = mtx*p*2.01;
        f += 0.250000*noise( p ); p = mtx*p*2.03;
        f += 0.125000*noise( p ); p = mtx*p*2.01;
        f += 0.062500*noise( p ); p = mtx*p*2.04;
        f += 0.015625*noise( p + sin(iTime) );

        return f/0.96875;
    }

    float pattern( in vec2 p ) {
        return fbm( p + fbm( p + fbm( p ) ) );
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy; // Normalisation des coordonnées de fragment
        float shade = pattern(uv);
        gl_FragColor = vec4(colormap(shade).rgb, shade);
    }
    `;
}

function vertexShader() {
    return `
    varying vec2 vUv;

    void main() {
        vUv = uv; // Passer les coordonnées UV au fragment shader
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;
}

// Initialisation de l'horloge pour le delta de temps
const clock = new THREE.Clock();

// Load Structure model
const loader = new GLTFLoader();
let loaded = false;

loader.load("assets/Assemblage1.glb", function (gltf) {
    structure_model = gltf.scene; // Assignation à la variable globale
    structure_model.scale.set(0.01, 0.01, 0.01); 
    structure_model.position.set(2, 2, 10); // Place it on the ground
    scene.add(structure_model);
    loaded = true;
    document.getElementById("loading").style.display = "none";


    // Add powerful directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // White light, intensity 2
    directionalLight.position.set(10, 50, 50); // Position the light above and to the side
    directionalLight.target = structure_model; // Aim the light at the structure
    scene.add(directionalLight);
    // Add powerful directional light2
    const directional2Light = new THREE.DirectionalLight(0xffffff, 2); // White light, intensity 2
    directional2Light.position.set(-10, 50, -50); // Position the light above and to the side
    directional2Light.target = structure_model; // Aim the light at the structure
    scene.add(directional2Light);

    var myshader =  new THREE.ShaderMaterial({
        uniforms         : uniforms,
        fragmentShader    : fragmentShader(),
        vertexShader        : vertexShader(),
      });

    structure_model.traverse((child) => {
        if (child.name === 'Object_20') {
            child.material = myshader; // Appliquer la texture
            child.material.transparent = true;   // Activer la transparence
            child.material.opacity = 0.7;        // Ajuster l'opacité
            // child.material.depthWrite = false;   // Désactiver l'écriture de profondeur pour bien gérer la transparence
            child.material.needsUpdate = true;   // Indiquer que le matériau a été mis à jour
        }
    });

    structure_model.traverse((child) => {
        if (child.name === 'Object_10') {
            child.material = new THREE.MeshPhysicalMaterial({
                transparent: true,
                opacity: 0.2,
                transmission: 1,
                depthWrite: false,
                depthTest: false
            })
            
            //console.log(`Opacité de ${child.name} modifiée à :`, child.material.opacity);
        }
    });

    // Load Chariot1 model
    const chariotLoader1 = new GLTFLoader();
    chariotLoader1.load("assets/Chariot1.glb", function (gltf) {
    chariot1_model = gltf.scene;

    // Scale et position
    chariot1_model.scale.set(9, 9, 9);
    chariot1_model.position.set(-135, -0.8, 70.5);
    scene.add(chariot1_model);

        // Add light to the chariot
        const chariotLight = new THREE.PointLight(0xffffff, 1, 10); // White light, intensity, distance
        chariotLight.position.set(-135, 5, 70.5); // Position the light above the chariot
        chariotLight.castShadow = true; // Optional: enable shadow casting
        scene.add(chariotLight);

        
    const chariotLoader2 = new GLTFLoader();
    chariotLoader2.load("assets/Chariot2.glb", function (gltf) {
    chariot2_model = gltf.scene;

    // Scale et position
    chariot2_model.scale.set(9, 9, 9);
    chariot2_model.position.set(-130, -0.8, 70.5);
    scene.add(chariot2_model);  

            // Add light to the chariot
            const chariot2Light = new THREE.PointLight(0xffffff, 1, 10); // White light, intensity, distance
            chariot2Light.position.set(-130, 5, 70.5); // Position the light above the chariot
            chariot2Light.castShadow = true; // Optional: enable shadow casting
            scene.add(chariot2Light)
            console.log(chariot1_model)
            console.log(chariot2_model)
            ;
        }, function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + "% loaded");
        });
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + "% loaded");
    });
}, function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + "% loaded");
});

// Variables pour le raycasting et la position de la souris
const raycaster = new THREE.Raycaster();
const pointerPosition = { x: 0, y: 0 };
let tooltip = document.createElement("div"); // Création d'un élément pour la bulle
tooltip.classList.add("tooltip"); // Ajoute une classe CSS pour le style
tooltip.style.display = "none"; // Cache la bulle par défaut
document.body.appendChild(tooltip); // Ajoute la bulle au body

// Fonction pour vérifier les intersections avec le raycaster
function checkIntersections() {
    raycaster.setFromCamera(pointerPosition, camera);

    // Vérifie si le modèle de structure est chargé
    if (loaded) {
        const intersects = raycaster.intersectObject(structure_model, true);

        if (intersects.length > 0) {
            tooltip.style.display = "block"; // Affiche la bulle
            tooltip.style.left = `${event.clientX + 15}px`; // Positionne la bulle par rapport à la souris
            tooltip.style.top = `${event.clientY + 15}px`;
            // Contenu de la bulle
            tooltip.innerHTML = `
                <h1 style="font-family: 'Papyrus', fantasy; font-size: 20px; margin-bottom: 10px; text-align: center;">THE SOLAR SHARE</h1>
                <p>THE SOLAR SHARE is a sustainable flows estimation experiment. This artistic provocation seeks to estimate the orders of magnitude of new solar energy income harvested by photosynthetic organism at a planetary scale, fundamental to all planetary life processes.</p>
                <p>The structure comprises an aluminum profile supporting a one-square-meter aquarium, equipped with sensors continuously measuring brightness, temperature, pH and spirulina concentration, visualizing the conversion of solar energy into edible biomass.</p>
            `;
        } else {
            tooltip.style.display = "none"; // Cache la bulle si la souris n'est pas sur la structure
        }
        }
        // Vérifie les intersections pour Chariot 1
    if (chariot1_model) {
        const chariot1Intersects = raycaster.intersectObject(chariot1_model, true);
        if (chariot1Intersects.length > 0) {
            chariot1Tooltip.style.display = "block";
            chariot1Tooltip.style.left = `${event.clientX + 15}px`;
            chariot1Tooltip.style.top = `${event.clientY + 15}px`;
            chariot1Tooltip.innerHTML = `
                <p>This trolley is used for harvesting spirulina. On it, you can observe the pumps and filters utilized for the harvest. The support on the left is designed to allow the filter to dry, and an integrated screen displays sensor data and provides access to the project's website.</p>
            `;
        } else {
            chariot1Tooltip.style.display = "none";
        }
    }

    // Vérifie les intersections pour Chariot 2
    if (chariot2_model) {
        const chariot2Intersects = raycaster.intersectObject(chariot2_model, true);
        if (chariot2Intersects.length > 0) {
            chariot2Tooltip.style.display = "block";
            chariot2Tooltip.style.left = `${event.clientX + 15}px`;
            chariot2Tooltip.style.top = `${event.clientY + 15}px`;
            chariot2Tooltip.innerHTML = `
                <p>This trolley is designed to showcase the spirulina-filled filters after they have dried. It includes small reports for documenting the amount of spirulina harvested, the day’s sunlight exposure, and additional data collected by the system.</p>
            `;
        } else {
            chariot2Tooltip.style.display = "none";
        }
    }
}


// Écouteur d'événement pour la position de la souris
window.addEventListener("pointermove", (event) => {
    pointerPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    checkIntersections(); // Vérifie les intersections à chaque mouvement de la souris
});

console.log("Camera position:", camera.position, "Camera direction:", camera.getWorldDirection(new THREE.Vector3()));


// Tableau pour stocker les bulles
const bubbles = [];

// Largeur de l'aquarium
const aquariumWidth = 8.5;  // Ajuste cette valeur selon la taille de l'aquarium

// Fonction pour créer des bulles à des positions différentes le long de l'aquarium
function createBubble() {
    const bubbleGeometry = new THREE.SphereGeometry(0.1, 16, 16); // Taille des bulles
    const bubbleMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,  // Couleur bleu clair
        transparent: true,
        opacity: 0.6,
        depthTest: false      // Bulles légèrement transparentes,
    });

    const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
    
    // Position aléatoire sur la largeur (x) et un point spécifique pour y et z
    const randomX = Math.random() * aquariumWidth - aquariumWidth / 2 + 1.75; // Position x aléatoire sur la largeur
    const minHeight = 5.5;  // Hauteur minimale pour le départ
    const maxHeight = 7; // Hauteur maximale
    const randomY = Math.random() * (maxHeight - minHeight) + minHeight; // Hauteur aléatoire entre minHeight et maxHeight
    bubble.position.set(randomX, randomY, 10);  // Utilise randomY pour la hauteur initiale

    bubble.userData.speed = Math.random() * 0.03 + 0.01;  // Vitesse aléatoire pour chaque bulle
    scene.add(bubble);
    bubbles.push(bubble);
}

const numBubbles = 100;  // Par exemple, 20 bulles
for (let i = 0; i < numBubbles; i++) {
    createBubble();
}

// Fonction d'animation des bulles
function animateBubbles() {
    bubbles.forEach(bubble => {
        // Faire monter les bulles avec une vitesse propre à chaque bulle
        bubble.position.y += bubble.userData.speed; // Utiliser la vitesse propre à chaque bulle

        // Si la bulle atteint une certaine hauteur, la réinitialiser en bas
        if (bubble.position.y > 16) {  // Par exemple, hauteur max à 14
            const minHeight = 5.5;  // Hauteur minimale pour le départ
            const maxHeight = 7; // Hauteur maximale
            const randomY = Math.random() * (maxHeight - minHeight) + minHeight; // Hauteur aléatoire entre minHeight et maxHeight

            bubble.position.y = randomY;    // Remettre la bulle en bas à hauteur 10

            // Réinitialiser la position x à une nouvelle position aléatoire sur la largeur
            bubble.position.x = Math.random() * aquariumWidth - aquariumWidth / 2 + 1.75;  
            bubble.position.z = 10;   // Remettre la position Z à l'endroit précis
            bubble.userData.speed = Math.random() * 0.02 + 0.01;  // Recalculer une vitesse aléatoire pour la prochaine montée
        }
    });
}

// Ajouter l'animation des bulles dans la fonction animate
const animate = () => {
    requestAnimationFrame(animate);

    animateBubbles(); // Appeler l'animation des bulles
    uniforms.iTime.value += clock.getDelta() * 0.1;
    controls.update();              // Mettre à jour les contrôles
    renderer.render(scene, camera);  // Rendu de la scène
};

animate();

// JS POUR LE SITE, PAS THREE

const tempSlider = document.getElementById('slider1');
const luxSlider = document.getElementById('slider2');
const phSlider = document.getElementById('slider3');
const spirulinaSaturationLabel = document.getElementById('spirulina-saturation');

// Valeurs affichées
const tempValueLabel = document.getElementById('temp-value');
const luxValueLabel = document.getElementById('lux-value');
const phValueLabel = document.getElementById('ph-value');

function calculateSpirulinaSaturation() {
    const temperature = parseInt(tempSlider.value);
    const luminosity = parseInt(luxSlider.value);
    const pH = parseInt(phSlider.value);
    console.log(temperature)

    let score = 0;

    // Évaluer la température
    if (temperature >= 30 && temperature <= 35) {
        score += 3; // Optimal
    } else if (temperature >= 27.5 && temperature < 30) {
        score += 2; // Optimal -
    } else if (temperature >= 25 && temperature < 27.5) {
        score += 1; // Middle +
    } else if (temperature > 35 && temperature <= 37.5) {
        score += 1; // Middle
    } else if (temperature > 37.5 && temperature <= 40) {
        score += 0.5; // Middle -
    } // Pas optimal ne change pas le score

    // Évaluer le pH
    if (pH >= 9 && pH <= 10) {
        score += 3; // Optimal
    } else if (pH >= 8.5 && pH < 9) {
        score += 2; // Optimal -
    } else if (pH >= 7 && pH < 8.5) {
        score += 1; // Middle +
    } else if (pH > 10 && pH <= 11.5) {
        score += 1; // Middle
    } else if (pH > 11.5 && pH <= 12) {
        score += 0.5; // Middle -
    } // Pas optimal ne change pas le score

    // Évaluer la luminosité
    if (luminosity >= 3000 && luminosity <= 5000) {
        score += 3; // Optimal
    } else if (luminosity >= 2500 && luminosity < 3000) {
        score += 2; // Optimal -
    } else if (luminosity >= 1500 && luminosity < 2500) {
        score += 1; // Middle +
    } else if (luminosity > 5000 && luminosity <= 6500) {
        score += 1; // Middle
    } else if (luminosity > 6500 && luminosity <= 10000) {
        score += 0.5; // Middle -
    } // Pas optimal ne change pas le score

    // Calculer la saturation de la spiruline
    let saturation;
    if (score === 9) {
        saturation = 2000; // Tout optimal
    } else if (score >= 8) {
        saturation = 1800; // Tout optimal -
    } else if (score >= 6) {
        saturation = 1500; // Deux optimaux + un intermédiaire
    } else if (score >= 4.5) {
        saturation = 1000; // Moyen fort
    } else if (score >= 3) {
        saturation = 500; // Moyen
    } else if (score >= 1.5) {
        saturation = 250; // Faible
    } else {
        saturation = 0; // Tout pas optimal
    }

    // Mettre à jour l'affichage de la saturation
    spirulinaSaturationLabel.textContent = `Spirulina Saturation: ${saturation.toFixed(1)} mg/L`;
    updateColorFactors(saturation);
}





function updateColorFactors(saturation) {
    // Ajuster les couleurs en fonction de la saturation
    if (saturation === 2000) {
        // Vert foncé
        uniforms.greenFactor.value = 0.0; // Aucun vert
        uniforms.redFactor.value = 0.2;    // Faible rouge
        uniforms.blueFactor.value = 0.2;   // Faible bleu
    } else if (saturation >= 1500) {
        // Vert clair
        uniforms.greenFactor.value = 0.2; // Vert plus prononcé
        uniforms.redFactor.value = 0.3;    // Rouge faible
        uniforms.blueFactor.value = 0.2;   // Bleu faible
    } else if (saturation >= 1000) {
        // Vert encore plus clair
        uniforms.greenFactor.value = 0.4; // Vert modéré
        uniforms.redFactor.value = 0.4;    // Rouge modéré
        uniforms.blueFactor.value = 0.3;   // Bleu faible
    } else if (saturation >= 500) {
        // Blanc transparent avec une touche de vert-bleu
        uniforms.greenFactor.value = 0.6; // Vert léger
        uniforms.redFactor.value = 0.5;    // Rouge faible
        uniforms.blueFactor.value = 0.4;   // Bleu léger
    } else if (saturation >= 250) {
        // Transition vers le blanc
        uniforms.greenFactor.value = 0.8; // Vert très léger
        uniforms.redFactor.value = 0.8;    // Rouge très léger
        uniforms.blueFactor.value = 0.7;   // Bleu léger
    } else {
        // Blanc transparent
        uniforms.greenFactor.value = 1.0; // Vert maximal
        uniforms.redFactor.value = 1.0;    // Rouge maximal
        uniforms.blueFactor.value = 1.0;   // Bleu maximal
    }

    // Recharger uniquement le matériel de l'objet cible pour appliquer les changements de shader
    object10.material.needsUpdate = true;
}

// Mettre à jour les valeurs des sliders
function updateSliderValues() {
    tempValueLabel.textContent = `${tempSlider.value} °C`;
    luxValueLabel.textContent = `${luxSlider.value} lux`;
    phValueLabel.textContent = `${phSlider.value}`;
}

// Événements pour recalculer la saturation et mettre à jour les valeurs lorsque les sliders changent
tempSlider.addEventListener('input', () => {
    updateSliderValues();
});
luxSlider.addEventListener('input', () => {
    updateSliderValues();
});
phSlider.addEventListener('input', () => {
    updateSliderValues();
});
const changeParamsButton = document.getElementById('change-params');

// Événement pour le bouton
changeParamsButton.addEventListener('click', () => {
    calculateSpirulinaSaturation(); // Met à jour la saturation
});

// Initialiser la saturation et les valeurs lors du chargement
updateSliderValues();
calculateSpirulinaSaturation();
 