// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const imageUpload = document.getElementById('image-upload');
const uploadArea = document.getElementById('upload-area');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const gridOverlay = document.getElementById('grid-overlay');
const removeImageBtn = document.getElementById('remove-image');
const optionsSection = document.getElementById('options-section');
const progressSection = document.getElementById('progress-section');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const splitDirectionOptions = document.querySelectorAll('.split-option');
const splitCountInput = document.getElementById('split-count');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');
const splitBtn = document.getElementById('split-btn');
const resetBtn = document.getElementById('reset-btn');
const resultsSection = document.getElementById('results-section');
const resultContainer = document.getElementById('result-container');
const downloadAllBtn = document.getElementById('download-all-btn');
const downloadText = document.getElementById('download-text');
const zipLoadingIcon = document.querySelector('.zip-loading');
const newImageBtn = document.getElementById('new-image-btn');
const gridOptions = document.getElementById('grid-options');
const gridRowsInput = document.getElementById('grid-rows');
const gridColsInput = document.getElementById('grid-cols');
const incrementRowsBtn = document.getElementById('increment-rows');
const decrementRowsBtn = document.getElementById('decrement-rows');
const incrementColsBtn = document.getElementById('increment-cols');
const decrementColsBtn = document.getElementById('decrement-cols');
const splitCountSection = document.getElementById('split-count-section');

// State
let currentImage = null;
let splitDirection = 'horizontal';
let splitCount = 2;
let gridRows = 2;
let gridCols = 2;
let generatedImages = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
    }
    
    // Set up event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
    });
    
    // File upload
    imageUpload.addEventListener('change', handleImageUpload);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            imageUpload.files = e.dataTransfer.files;
            handleImageUpload();
        }
    });
    
    // Remove image
    removeImageBtn.addEventListener('click', resetImage);
    
    // Split direction
    splitDirectionOptions.forEach(option => {
        option.addEventListener('click', () => {
            splitDirectionOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            splitDirection = option.dataset.direction;
            
            // Show/hide appropriate options
            if (splitDirection === 'grid') {
                gridOptions.classList.add('active');
                splitCountSection.classList.add('hidden');
            } else {
                gridOptions.classList.remove('active');
                splitCountSection.classList.remove('hidden');
            }
            
            updateGridOverlay();
        });
    });
    
    // Split count
    incrementBtn.addEventListener('click', () => {
        if (splitCount < 10) {
            splitCountInput.value = ++splitCount;
            updateGridOverlay();
        }
    });
    
    decrementBtn.addEventListener('click', () => {
        if (splitCount > 2) {
            splitCountInput.value = --splitCount;
            updateGridOverlay();
        }
    });
    
    splitCountInput.addEventListener('change', () => {
        let value = parseInt(splitCountInput.value);
        if (isNaN(value) || value < 2) value = 2;
        if (value > 10) value = 10;
        splitCountInput.value = value;
        splitCount = value;
        updateGridOverlay();
    });
    
    // Grid rows
    incrementRowsBtn.addEventListener('click', () => {
        if (gridRows < 10) {
            gridRowsInput.value = ++gridRows;
            updateGridOverlay();
        }
    });
    
    decrementRowsBtn.addEventListener('click', () => {
        if (gridRows > 2) {
            gridRowsInput.value = --gridRows;
            updateGridOverlay();
        }
    });
    
    gridRowsInput.addEventListener('change', () => {
        let value = parseInt(gridRowsInput.value);
        if (isNaN(value) || value < 2) value = 2;
        if (value > 10) value = 10;
        gridRowsInput.value = value;
        gridRows = value;
        updateGridOverlay();
    });
    
    // Grid columns
    incrementColsBtn.addEventListener('click', () => {
        if (gridCols < 10) {
            gridColsInput.value = ++gridCols;
            updateGridOverlay();
        }
    });
    
    decrementColsBtn.addEventListener('click', () => {
        if (gridCols > 2) {
            gridColsInput.value = --gridCols;
            updateGridOverlay();
        }
    });
    
    gridColsInput.addEventListener('change', () => {
        let value = parseInt(gridColsInput.value);
        if (isNaN(value) || value < 2) value = 2;
        if (value > 10) value = 10;
        gridColsInput.value = value;
        gridCols = value;
        updateGridOverlay();
    });
    
    // Split button
    splitBtn.addEventListener('click', splitImage);
    
    // Reset button
    resetBtn.addEventListener('click', resetOptions);
    
    // Download all as ZIP
    downloadAllBtn.addEventListener('click', downloadAllAsZip);
    
    // New image
    newImageBtn.addEventListener('click', () => {
        resetImage();
        resetOptions();
        resultsSection.classList.add('hidden');
        uploadArea.classList.remove('hidden');
    });
}

function handleImageUpload() {
    const file = imageUpload.files[0];
    if (!file || !file.type.match('image.*')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImage = new Image();
        currentImage.onload = () => {
            imagePreview.src = e.target.result;
            
            // ต้องรอให้ภาพพรีวิวโหลดเสร็จก่อนค่อยอัปเดตเส้นกริด
            imagePreview.onload = () => {
                imagePreviewContainer.classList.remove('hidden');
                uploadArea.classList.add('hidden');
                optionsSection.classList.remove('hidden');
                updateGridOverlay();
            };
        };
        currentImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function updateGridOverlay() {
    if (!currentImage) return;
    
    // Clear existing overlay
    gridOverlay.innerHTML = '';
    
    // ใช้ขนาดภาพจริงในการคำนวณสัดส่วน
    const naturalWidth = currentImage.naturalWidth;
    const naturalHeight = currentImage.naturalHeight;
    
    // ใช้ขนาดที่แสดงบนหน้าจอสำหรับตำแหน่ง
    const displayedWidth = imagePreview.offsetWidth;
    const displayedHeight = imagePreview.offsetHeight;
    
    // คำนวณอัตราส่วน
    const widthRatio = displayedWidth / naturalWidth;
    const heightRatio = displayedHeight / naturalHeight;
    
    // Draw grid based on selected direction
    if (splitDirection === 'horizontal') {
        const partHeight = naturalHeight / splitCount;
        for (let i = 1; i < splitCount; i++) {
            const line = document.createElement('div');
            line.className = 'split-line horizontal';
            // ปรับตำแหน่งตามสัดส่วน
            line.style.top = `${partHeight * i * heightRatio}px`;
            gridOverlay.appendChild(line);
        }
    } else if (splitDirection === 'vertical') {
        const partWidth = naturalWidth / splitCount;
        for (let i = 1; i < splitCount; i++) {
            const line = document.createElement('div');
            line.className = 'split-line vertical';
            // ปรับตำแหน่งตามสัดส่วน
            line.style.left = `${partWidth * i * widthRatio}px`;
            gridOverlay.appendChild(line);
        }
    } else if (splitDirection === 'grid') {
        // Draw horizontal lines (rows)
        const rowHeight = naturalHeight / gridRows;
        for (let i = 1; i < gridRows; i++) {
            const line = document.createElement('div');
            line.className = 'split-line horizontal';
            // ปรับตำแหน่งตามสัดส่วน
            line.style.top = `${rowHeight * i * heightRatio}px`;
            gridOverlay.appendChild(line);
        }
        
        // Draw vertical lines (columns)
        const colWidth = naturalWidth / gridCols;
        for (let i = 1; i < gridCols; i++) {
            const line = document.createElement('div');
            line.className = 'split-line vertical';
            // ปรับตำแหน่งตามสัดส่วน
            line.style.left = `${colWidth * i * widthRatio}px`;
            gridOverlay.appendChild(line);
        }
    }
}

function splitImage() {
    if (!currentImage) return;
    
    // Show progress bar
    progressSection.classList.remove('hidden');
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            processSplitting();
        }
    }, 100);
}

function processSplitting() {
    // Clear previous results
    resultContainer.innerHTML = '';
    generatedImages = [];
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = currentImage.naturalWidth;
    canvas.height = currentImage.naturalHeight;
    ctx.drawImage(currentImage, 0, 0);
    
    // Create result container
    const container = document.createElement('div');
    container.className = 'result-grid';
    
    if (splitDirection === 'horizontal') {
        container.classList.add('grid-cols-1');
        const partHeight = Math.floor(currentImage.naturalHeight / splitCount);
        
        for (let i = 0; i < splitCount; i++) {
            const y = i * partHeight;
            const height = (i === splitCount - 1) ? currentImage.naturalHeight - y : partHeight;
            
            // Create canvas for this part
            const partCanvas = document.createElement('canvas');
            partCanvas.width = currentImage.naturalWidth;
            partCanvas.height = height;
            const partCtx = partCanvas.getContext('2d');
            partCtx.drawImage(canvas, 0, -y);
            
            // Create image from canvas
            const imageData = partCanvas.toDataURL('image/jpeg');
            generatedImages.push({
                data: imageData,
                name: `image-part-${i+1}.jpg`,
                title: `ส่วนที่ ${i+1}`
            });
            
            // Create result item
            const resultItem = createResultItem(i, imageData, `ส่วนที่ ${i+1}`);
            container.appendChild(resultItem);
        }
    } else if (splitDirection === 'vertical') {
        // Use grid layout with specified columns
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${splitCount}, 1fr)`;
        
        const partWidth = Math.floor(currentImage.naturalWidth / splitCount);
        
        for (let i = 0; i < splitCount; i++) {
            const x = i * partWidth;
            const width = (i === splitCount - 1) ? currentImage.naturalWidth - x : partWidth;
            
            // Create canvas for this part
            const partCanvas = document.createElement('canvas');
            partCanvas.width = width;
            partCanvas.height = currentImage.naturalHeight;
            const partCtx = partCanvas.getContext('2d');
            partCtx.drawImage(canvas, -x, 0);
            
            // Create image from canvas
            const imageData = partCanvas.toDataURL('image/jpeg');
            generatedImages.push({
                data: imageData,
                name: `image-part-${i+1}.jpg`,
                title: `ส่วนที่ ${i+1}`
            });
            
            // Create result item
            const resultItem = createResultItem(i, imageData, `ส่วนที่ ${i+1}`);
            container.appendChild(resultItem);
        }
    } else if (splitDirection === 'grid') {
        // Create a grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-result-container';
        
        const rowHeight = Math.floor(currentImage.naturalHeight / gridRows);
        const colWidth = Math.floor(currentImage.naturalWidth / gridCols);
        
        for (let row = 0; row < gridRows; row++) {
            const rowContainer = document.createElement('div');
            rowContainer.className = 'grid-row';
            
            for (let col = 0; col < gridCols; col++) {
                const y = row * rowHeight;
                const x = col * colWidth;
                const height = (row === gridRows - 1) ? currentImage.naturalHeight - y : rowHeight;
                const width = (col === gridCols - 1) ? currentImage.naturalWidth - x : colWidth;
                
                // Create canvas for this part
                const partCanvas = document.createElement('canvas');
                partCanvas.width = width;
                partCanvas.height = height;
                const partCtx = partCanvas.getContext('2d');
                partCtx.drawImage(canvas, -x, -y);
                
                // Create image from canvas
                const imageData = partCanvas.toDataURL('image/jpeg');
                const partIndex = row * gridCols + col;
                generatedImages.push({
                    data: imageData,
                    name: `image-part-${row+1}-${col+1}.jpg`,
                    title: `แถว ${row+1} คอลัมน์ ${col+1}`
                });
                
                // Create result item
                const resultItem = createResultItem(partIndex, imageData, `แถว ${row+1} คอลัมน์ ${col+1}`);
                
                // Add to grid item
                const gridItem = document.createElement('div');
                gridItem.className = 'grid-item';
                gridItem.appendChild(resultItem);
                rowContainer.appendChild(gridItem);
            }
            
            gridContainer.appendChild(rowContainer);
        }
        
        container.appendChild(gridContainer);
    }
    
    resultContainer.appendChild(container);
    resultsSection.classList.remove('hidden');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function createResultItem(index, imageData, title) {
    const item = document.createElement('div');
    item.className = 'result-item fade-in';
    
    const img = document.createElement('img');
    img.src = imageData;
    img.alt = title;
    img.className = 'w-full h-auto';
    
    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-4';
    
    const titleElem = document.createElement('h3');
    titleElem.className = 'text-white font-medium';
    titleElem.textContent = title;
    
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'mt-2 bg-white text-gray-800 hover:bg-gray-100 px-3 py-1 rounded text-sm font-medium flex items-center justify-center w-full';
    downloadBtn.innerHTML = '<i class="fas fa-download mr-2"></i> ดาวน์โหลด';
    
    downloadBtn.addEventListener('click', () => {
        downloadImage(imageData, `image-part-${index+1}.jpg`);
    });
    
    overlay.appendChild(titleElem);
    overlay.appendChild(downloadBtn);
    
    item.appendChild(img);
    item.appendChild(overlay);
    
    return item;
}

function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function downloadAllAsZip() {
    if (generatedImages.length === 0) return;
    
    // Show loading state
    downloadAllBtn.disabled = true;
    zipLoadingIcon.classList.add('active');
    downloadText.textContent = 'กำลังสร้างไฟล์ ZIP...';
    
    try {
        const zip = new JSZip();
        const imgFolder = zip.folder("split_images");
        
        // Add each image to the zip
        for (let i = 0; i < generatedImages.length; i++) {
            const img = generatedImages[i];
            const base64Data = img.data.split(',')[1];
            imgFolder.file(img.name, base64Data, { base64: true });
            
            // Update progress (optional)
            downloadText.textContent = `กำลังบีบอัด... (${i+1}/${generatedImages.length})`;
        }
        
        // Generate the zip file
        const content = await zip.generateAsync({ type: "blob" }, (metadata) => {
            // Progress callback (optional)
            if (metadata.percent) {
                downloadText.textContent = `กำลังบีบอัด... ${Math.round(metadata.percent)}%`;
            }
        });
        
        // Download the zip
        saveAs(content, "split_images.zip");
        
    } catch (error) {
        console.error("Error creating ZIP file:", error);
        alert("เกิดข้อผิดพลาดในการสร้างไฟล์ ZIP");
    } finally {
        // Reset button state
        downloadAllBtn.disabled = false;
        zipLoadingIcon.classList.remove('active');
        downloadText.textContent = 'ดาวน์โหลดทั้งหมด (ZIP)';
    }
}

function resetImage() {
    imagePreview.src = '';
    imagePreviewContainer.classList.add('hidden');
    uploadArea.classList.remove('hidden');
    optionsSection.classList.add('hidden');
    progressSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    currentImage = null;
    imageUpload.value = '';
}

function resetOptions() {
    splitCount = 2;
    splitCountInput.value = '2';
    splitDirection = 'horizontal';
    gridRows = 2;
    gridCols = 2;
    gridRowsInput.value = '2';
    gridColsInput.value = '2';
    
    // Reset direction options
    splitDirectionOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.direction === 'horizontal') {
            option.classList.add('active');
        }
    });
    
    // Hide grid options
    gridOptions.classList.remove('active');
    splitCountSection.classList.remove('hidden');
    
    if (currentImage) {
        updateGridOverlay();
    }
}

// Initialize with example functionality
window.onload = function() {
    // For demo purposes - simulate an image load
    setTimeout(() => {
        imagePreview.src = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        imagePreviewContainer.classList.remove('hidden');
        uploadArea.classList.add('hidden');
        optionsSection.classList.remove('hidden');
        
        // Create an image for the demo
        currentImage = new Image();
        currentImage.onload = () => {
            updateGridOverlay();
        };
        currentImage.src = imagePreview.src;
    }, 1000);
};