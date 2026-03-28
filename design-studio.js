/**
 * Design Studio — My Baking Creations
 * Shared JS for both standalone (design-studio.html) and widget (order-form.html)
 *
 * Context detection:
 *   #studioStandalone  → full standalone experience (overlays, refinement, PDF, builder)
 *   #studioWidget      → inline widget inside the order form
 */
(function () {
    'use strict';

    // =========================================================
    // CONTEXT DETECTION
    // =========================================================
    const isStandalone = document.getElementById('studioStandalone') !== null;
    const isWidget     = document.getElementById('studioWidget') !== null;

    // Bail if neither context marker is present
    if (!isStandalone && !isWidget) return;

    const WORKER_URL = 'https://cakeplugin.summer-lake-b6ea.workers.dev/';

    // =========================================================
    // SHARED UTILITIES — Color Palette Extraction
    // =========================================================

    function extractColorPalette(imageSrc, swatchContainerId) {
        var containerId = swatchContainerId || 'colorSwatches';
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            var colors = [];
            var step = Math.max(1, Math.floor(imageData.length / 4 / 1000));

            for (var i = 0; i < imageData.length; i += 4 * step) {
                var r = imageData[i];
                var g = imageData[i + 1];
                var b = imageData[i + 2];
                if ((r + g + b) > 60 && (r + g + b) < 700) {
                    colors.push({ r: r, g: g, b: b });
                }
            }

            var dominantColors = kMeansColors(colors, 5);
            displayColorSwatches(dominantColors, containerId);
        };
        img.src = imageSrc;
    }

    function kMeansColors(colors, k) {
        if (colors.length < k) return colors.map(function (c) { return { r: c.r, g: c.g, b: c.b }; });

        var centroids = [];
        var shuffled = colors.slice().sort(function () { return Math.random() - 0.5; });
        for (var i = 0; i < k; i++) {
            centroids.push({ r: shuffled[i].r, g: shuffled[i].g, b: shuffled[i].b });
        }

        for (var iter = 0; iter < 10; iter++) {
            var clusters = [];
            for (var ci = 0; ci < k; ci++) clusters.push([]);

            colors.forEach(function (color) {
                var minDist = Infinity;
                var closest = 0;
                centroids.forEach(function (centroid, idx) {
                    var dist = Math.sqrt(
                        Math.pow(color.r - centroid.r, 2) +
                        Math.pow(color.g - centroid.g, 2) +
                        Math.pow(color.b - centroid.b, 2)
                    );
                    if (dist < minDist) {
                        minDist = dist;
                        closest = idx;
                    }
                });
                clusters[closest].push(color);
            });

            centroids = clusters.map(function (cluster, idx) {
                if (cluster.length === 0) return centroids[idx];
                return {
                    r: Math.round(cluster.reduce(function (s, c) { return s + c.r; }, 0) / cluster.length),
                    g: Math.round(cluster.reduce(function (s, c) { return s + c.g; }, 0) / cluster.length),
                    b: Math.round(cluster.reduce(function (s, c) { return s + c.b; }, 0) / cluster.length)
                };
            });
        }

        return centroids;
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(function (x) { return x.toString(16).padStart(2, '0'); }).join('').toUpperCase();
    }

    function displayColorSwatches(colors, containerId) {
        var container = document.getElementById(containerId || 'colorSwatches');
        if (!container) return;
        container.innerHTML = '';

        colors.forEach(function (color) {
            var hex = rgbToHex(color.r, color.g, color.b);
            var swatch = document.createElement('div');
            swatch.style.cssText =
                'width:45px;height:45px;background:' + hex +
                ';border-radius:8px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);' +
                'position:relative;transition:transform 0.2s;';
            swatch.title = 'Click to copy: ' + hex;

            var label = document.createElement('span');
            label.style.cssText =
                'position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);' +
                'font-size:0.65rem;font-family:monospace;color:#666;white-space:nowrap;';
            label.textContent = hex;
            swatch.appendChild(label);

            swatch.addEventListener('mouseenter', function () { swatch.style.transform = 'scale(1.1)'; });
            swatch.addEventListener('mouseleave', function () { swatch.style.transform = 'scale(1)'; });
            swatch.addEventListener('click', function () {
                navigator.clipboard.writeText(hex).then(function () {
                    var orig = label.textContent;
                    label.textContent = 'Copied!';
                    label.style.color = 'var(--pink)';
                    setTimeout(function () {
                        label.textContent = orig;
                        label.style.color = '#666';
                    }, 1500);
                });
            });

            container.appendChild(swatch);
        });
    }

    // =========================================================
    // SHARED UTILITIES — PDF Generation helpers
    // =========================================================

    function ensureJsPDF(callback) {
        var lib = window.jspdf;
        if (lib && lib.jsPDF) {
            callback();
        } else {
            var script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = callback;
            document.head.appendChild(script);
        }
    }

    // =========================================================
    // SHARED — Worker call helper
    // =========================================================

    async function callWorker(description, productType) {
        var response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: description, productType: productType || 'cake' })
        });
        return response.json();
    }

    // =========================================================
    // QUICK SKETCH — shared generate logic
    // =========================================================

    /**
     * Get the description source textarea depending on context.
     * Standalone: #sketchStandaloneDesc (textarea inside the sketcher overlay)
     * Widget:     #order_details (the order form textarea)
     */
    function getDescriptionSource() {
        if (isStandalone) {
            return document.getElementById('sketchStandaloneDesc');
        }
        return document.getElementById('order_details');
    }

    function getProductType() {
        var radio = document.querySelector('input[name="product_type"]:checked');
        return radio ? radio.value : 'Cake';
    }

    // =========================================================
    // QUICK SKETCH — STANDALONE overlay mode
    // =========================================================

    function initSketcherStandalone() {
        var overlay        = document.getElementById('sketcherOverlay');
        var closeBtn       = document.getElementById('sketcherCloseBtn');
        var editBtn        = document.getElementById('sketchEditBtn');
        var switchBtn      = document.getElementById('switchToBuilderBtn');
        var descPreview    = document.getElementById('sketchDescPreview');
        var emptyState     = document.getElementById('sketchEmptyState');
        var prevLoading    = document.getElementById('previewLoading');
        var prevResult     = document.getElementById('previewResult');
        var prevImage      = document.getElementById('previewImage');
        var prevError      = document.getElementById('previewError');
        var downloadBtn    = document.getElementById('downloadPreviewBtn');
        var generateBtn    = document.getElementById('generatePreviewBtn');
        var descTextarea   = getDescriptionSource();

        if (!overlay) return;

        // Move overlay to body to escape transform containing block
        document.body.appendChild(overlay);

        // --- Open / Close ---
        function openOverlay() {
            var desc = descTextarea ? descTextarea.value.trim() : '';
            if (descPreview) {
                if (desc) {
                    descPreview.textContent = desc;
                    descPreview.style.fontStyle = 'italic';
                } else {
                    descPreview.textContent = 'Type your cake description below, then hit Generate.';
                    descPreview.style.fontStyle = 'normal';
                }
            }
            overlay.classList.add('open');
            document.body.classList.add('sketcher-open');
            if (prevResult && prevResult.style.display !== 'none') {
                if (emptyState) emptyState.style.display = 'none';
            }
        }

        function closeOverlay() {
            overlay.classList.remove('open');
            document.body.classList.remove('sketcher-open');
        }

        // Mode fork: clicking cards from the standalone landing page
        var sketchCard = document.getElementById('forkSketchBtn') || document.getElementById('openSketcherBtn');
        if (sketchCard) sketchCard.addEventListener('click', openOverlay);

        // Builder fork button → triggers the hidden cakeBuilderMode button
        var builderForkBtn = document.getElementById('forkBuilderBtn');
        if (builderForkBtn) {
            builderForkBtn.addEventListener('click', function () {
                var builderTrigger = document.getElementById('cakeBuilderMode');
                if (builderTrigger) builderTrigger.click();
            });
        }

        if (closeBtn) closeBtn.addEventListener('click', closeOverlay);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('open')) {
                closeOverlay();
            }
        });

        // --- Edit button ---
        // Standalone: focuses the in-overlay textarea
        if (editBtn) {
            editBtn.addEventListener('click', function () {
                if (isStandalone && descTextarea) {
                    descTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    descTextarea.focus();
                }
            });
        }

        // --- Switch to builder ---
        if (switchBtn) {
            switchBtn.addEventListener('click', function () {
                closeOverlay();
                var builderTrigger = document.getElementById('cakeBuilderMode');
                if (builderTrigger) {
                    setTimeout(function () { builderTrigger.click(); }, 400);
                }
            });
        }

        // --- Generate (Quick Sketch) ---
        if (generateBtn) {
            generateBtn.addEventListener('click', async function () {
                var description = descTextarea ? descTextarea.value.trim() : '';

                if (description.length < 10) {
                    if (prevError) {
                        prevError.textContent = 'Please describe your design first (at least a few words about theme, colors, etc.)';
                        prevError.style.display = 'block';
                    }
                    if (prevResult) prevResult.style.display = 'none';
                    if (descTextarea) descTextarea.focus();
                    return;
                }

                if (prevLoading) prevLoading.style.display = 'block';
                if (prevResult) prevResult.style.display = 'none';
                if (prevError) prevError.style.display = 'none';
                if (emptyState) emptyState.style.display = 'none';
                generateBtn.disabled = true;
                generateBtn.style.opacity = '0.6';

                try {
                    var data = await callWorker(description, getProductType());

                    if (data.error) {
                        if (prevError) {
                            prevError.textContent = data.error;
                            prevError.style.display = 'block';
                        }
                    } else if (data.image) {
                        if (prevImage) prevImage.src = data.image;
                        if (downloadBtn) downloadBtn.href = data.image;
                        if (prevResult) prevResult.style.display = 'block';
                        extractColorPalette(data.image, 'colorSwatches');
                        // Clear refinement history
                        var historyEl = document.getElementById('refinementHistory');
                        if (historyEl) historyEl.innerHTML = '';
                        var refInput = document.getElementById('refineInput');
                        if (refInput) refInput.value = '';
                    }
                } catch (error) {
                    console.error('Preview error:', error);
                    if (prevError) {
                        prevError.textContent = 'Could not generate preview. Please try again or just describe your cake!';
                        prevError.style.display = 'block';
                    }
                } finally {
                    if (prevLoading) prevLoading.style.display = 'none';
                    generateBtn.disabled = false;
                    generateBtn.style.opacity = '1';
                }
            });
        }

        // --- Refinement logic ---
        initRefinement(descTextarea, prevLoading, prevError, prevImage, downloadBtn);

        // --- PDF download (Quick Sketch) ---
        var downloadPdfBtn = document.getElementById('downloadPdfBtn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', function () {
                ensureJsPDF(function () { generateSketchPDF(descTextarea, prevImage); });
            });
        }
    }

    // =========================================================
    // QUICK SKETCH — WIDGET inline mode (order-form.html)
    // =========================================================

    function initSketcherWidget() {
        var generateBtn    = document.getElementById('generatePreviewBtn');
        var prevLoading    = document.getElementById('previewLoading');
        var prevResult     = document.getElementById('previewResult');
        var prevImage      = document.getElementById('previewImage');
        var prevError      = document.getElementById('previewError');
        var downloadBtn    = document.getElementById('downloadPreviewBtn');
        var descTextarea   = document.getElementById('order_details');

        if (!generateBtn) return;

        generateBtn.addEventListener('click', async function () {
            var description = descTextarea ? descTextarea.value.trim() : '';

            if (description.length < 10) {
                if (prevError) {
                    prevError.textContent = 'Please describe your design above first (at least a few words about theme, colors, etc.)';
                    prevError.style.display = 'block';
                }
                if (prevResult) prevResult.style.display = 'none';
                if (descTextarea) descTextarea.focus();
                return;
            }

            if (prevLoading) prevLoading.style.display = 'block';
            if (prevResult) prevResult.style.display = 'none';
            if (prevError) prevError.style.display = 'none';
            generateBtn.disabled = true;
            generateBtn.style.opacity = '0.6';

            try {
                var data = await callWorker(description, getProductType());

                if (data.error) {
                    if (prevError) {
                        prevError.textContent = data.error;
                        prevError.style.display = 'block';
                    }
                } else if (data.image) {
                    if (prevImage) prevImage.src = data.image;
                    if (downloadBtn) downloadBtn.href = data.image;
                    if (prevResult) prevResult.style.display = 'block';
                    extractColorPalette(data.image, 'colorSwatches');
                    var historyEl = document.getElementById('refinementHistory');
                    if (historyEl) historyEl.innerHTML = '';
                    var refInput = document.getElementById('refineInput');
                    if (refInput) refInput.value = '';
                }
            } catch (error) {
                console.error('Preview error:', error);
                if (prevError) {
                    prevError.textContent = 'Could not generate preview. Please try again or just describe your cake!';
                    prevError.style.display = 'block';
                }
            } finally {
                if (prevLoading) prevLoading.style.display = 'none';
                generateBtn.disabled = false;
                generateBtn.style.opacity = '1';
            }
        });

        // Widget refinement + PDF are minimal — link out to full studio
        initRefinement(descTextarea, prevLoading, prevError, prevImage, downloadBtn);

        var downloadPdfBtn = document.getElementById('downloadPdfBtn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', function () {
                ensureJsPDF(function () { generateSketchPDF(descTextarea, prevImage); });
            });
        }
    }

    // =========================================================
    // SHARED — Refinement logic
    // =========================================================

    function initRefinement(descTextarea, prevLoading, prevError, prevImage, downloadBtn) {
        var refineBtn = document.getElementById('refineBtn');
        var refineInput = document.getElementById('refineInput');
        var refinementHistory = document.getElementById('refinementHistory');
        var refinementCount = 0;

        if (!refineBtn || !refineInput) return;

        refineBtn.addEventListener('click', async function () {
            var refinement = refineInput.value.trim();
            if (!refinement) { refineInput.focus(); return; }

            if (refinementCount >= 3) {
                alert('You\'ve reached the refinement limit. Start fresh with a new description!');
                return;
            }

            var originalDescription = descTextarea ? descTextarea.value.trim() : '';
            var combinedPrompt = originalDescription + '. Additional refinement: ' + refinement;

            if (prevLoading) prevLoading.style.display = 'block';
            refineBtn.disabled = true;
            refineBtn.style.opacity = '0.6';

            try {
                var data = await callWorker(combinedPrompt, getProductType());

                if (data.error) {
                    if (prevError) {
                        prevError.textContent = data.error;
                        prevError.style.display = 'block';
                    }
                } else if (data.image) {
                    if (prevImage) prevImage.src = data.image;
                    if (downloadBtn) downloadBtn.href = data.image;
                    extractColorPalette(data.image, 'colorSwatches');
                    refinementCount++;

                    if (refinementHistory) {
                        var historyItem = document.createElement('div');
                        historyItem.style.cssText = 'padding:4px 8px;background:#f0f0f0;border-radius:6px;margin-top:4px;display:inline-block;margin-right:4px;';
                        historyItem.textContent = '#' + refinementCount + ': "' + refinement + '"';
                        refinementHistory.appendChild(historyItem);
                    }

                    refineInput.value = '';

                    if (refinementCount >= 3) {
                        refineBtn.textContent = 'Limit Reached';
                        refineBtn.style.background = '#ccc';
                    } else {
                        refineBtn.textContent = 'Refine (' + (3 - refinementCount) + ' left)';
                    }
                }
            } catch (error) {
                console.error('Refine error:', error);
                if (prevError) {
                    prevError.textContent = 'Could not refine. Please try again!';
                    prevError.style.display = 'block';
                }
            } finally {
                if (prevLoading) prevLoading.style.display = 'none';
                refineBtn.disabled = false;
                refineBtn.style.opacity = '1';
            }
        });
    }

    // =========================================================
    // SHARED — Quick Sketch PDF
    // =========================================================

    function generateSketchPDF(descTextarea, prevImage) {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF();
        var pageWidth = doc.internal.pageSize.getWidth();
        var margin = 20;

        // Header
        doc.setFillColor(93, 78, 55);
        doc.rect(0, 0, pageWidth, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('My Baking Creations', margin, 22);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Your Custom Design Concept', margin, 30);

        doc.setTextColor(0, 0, 0);
        var yPos = 50;

        // Description
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Design Description', margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        var description = descTextarea ? descTextarea.value.trim() : '';
        var splitDesc = doc.splitTextToSize(description, pageWidth - 2 * margin);
        doc.text(splitDesc, margin, yPos);
        yPos += splitDesc.length * 5 + 10;

        // Product type
        var productType = getProductType();
        doc.setFontSize(12);
        doc.text('Product Type: ' + productType, margin, yPos);
        yPos += 15;

        // Image
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('AI Generated Preview', margin, yPos);
        yPos += 10;

        var imgSrc = prevImage ? prevImage.src : '';
        if (imgSrc) {
            try {
                var imgWidth = pageWidth - 2 * margin;
                var imgHeight = imgWidth * 0.75;
                doc.addImage(imgSrc, 'PNG', margin, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 10;
            } catch (e) {
                console.error('Could not add image to PDF:', e);
            }
        }

        // Color palette
        var swatches = document.querySelectorAll('#colorSwatches > div');
        if (swatches.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Color Palette', margin, yPos);
            yPos += 8;

            var xPos = margin;
            swatches.forEach(function (swatch) {
                var hex = swatch.querySelector('span') ? swatch.querySelector('span').textContent : '';
                var r = parseInt(hex.slice(1, 3), 16) || 0;
                var g = parseInt(hex.slice(3, 5), 16) || 0;
                var b = parseInt(hex.slice(5, 7), 16) || 0;

                doc.setFillColor(r, g, b);
                doc.rect(xPos, yPos, 20, 20, 'F');
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.text(hex, xPos, yPos + 26);
                xPos += 30;
            });
            yPos += 35;
        }

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('Design generated with help of Anthropic Claude', margin, 280);
        doc.text('mybakingcreations.com | (415) 568-8060', margin, 286);

        doc.save('my-cake-design-concept.pdf');
    }

    // =========================================================
    // CAKE BUILDER PRO — Full builder (standalone overlay)
    // =========================================================

    function initCakeBuilder() {
        // Elements
        var quickSketchMode  = document.getElementById('quickSketchMode');
        var cakeBuilderMode  = document.getElementById('cakeBuilderMode');
        var quickSketchSection = document.getElementById('quickSketchSection');
        var cakeBuilderSection = document.getElementById('cakeBuilderSection');
        var builderOverlay   = document.getElementById('builderFullscreenOverlay');
        var builderCloseBtn  = document.getElementById('builderCloseBtn');
        var builderBackLink  = document.getElementById('builderBackLink');

        // Config elements
        var builderCakeboard = document.getElementById('builderCakeboard');
        var builderTiers     = document.getElementById('builderTiers');
        var builderTopper    = document.getElementById('builderTopper');
        var builderWritingOptions = document.getElementById('builderWritingOptions');
        var builderWritingCheckboxes = builderWritingOptions ? builderWritingOptions.querySelectorAll('input[type="checkbox"]') : [];
        var stepsPreviewList = document.getElementById('stepsPreviewList');
        var startBuildingBtn = document.getElementById('startBuildingBtn');

        // Phase elements
        var builderConfig = document.getElementById('builderConfig');
        var builderSteps  = document.getElementById('builderSteps');
        var builderResult = document.getElementById('builderResult');

        // Step elements
        var progressSteps  = document.getElementById('progressSteps');
        var progressFill   = document.getElementById('progressFill');
        var progressLabel  = document.getElementById('progressLabel');
        var stepIcon        = document.getElementById('stepIcon');
        var stepTitle       = document.getElementById('stepTitle');
        var stepDescription = document.getElementById('stepDescription');
        var stepPrompt      = document.getElementById('stepPrompt');
        var stepBackBtn     = document.getElementById('stepBackBtn');
        var stepGenerateBtn = document.getElementById('stepGenerateBtn');
        var stepLoading     = document.getElementById('stepLoading');
        var loadingText     = document.getElementById('loadingText');
        var stepResult      = document.getElementById('stepResult');
        var stepResultImage = document.getElementById('stepResultImage');
        var stepRetryBtn    = document.getElementById('stepRetryBtn');
        var stepApproveBtn  = document.getElementById('stepApproveBtn');
        var stepError       = document.getElementById('stepError');
        var currentStepContent = document.getElementById('currentStepContent');

        // Result elements
        var finalCakeImage      = document.getElementById('finalCakeImage');
        var finalColorSwatches  = document.getElementById('finalColorSwatches');
        var specList            = document.getElementById('specList');
        var builderDownloadImg  = document.getElementById('builderDownloadImg');
        var builderDownloadPdf  = document.getElementById('builderDownloadPdf');
        var builderStartOver    = document.getElementById('builderStartOver');

        // State
        var currentSteps = [];
        var currentStepIndex = 0;
        var stepData = {};
        var generatedImages = [];

        // Step definitions
        var stepDefinitions = {
            cakeboard: {
                icon: '\uD83D\uDFEB',
                title: 'Design Your Cakeboard',
                description: 'Describe the color and style of your cakeboard covering.',
                placeholder: 'e.g., Elegant white fondant with silver pearl border...',
                loadingText: 'Creating your cakeboard...'
            },
            tier1: {
                icon: '\uD83C\uDF82',
                title: 'Design Tier 1 (Bottom)',
                description: 'Describe the bottom tier - the largest layer of your cake.',
                placeholder: 'e.g., Light blue fondant with white lace pattern and edible pearls...',
                loadingText: 'Building tier 1...'
            },
            tier2: {
                icon: '\uD83C\uDF82',
                title: 'Design Tier 2 (Middle)',
                description: 'Describe the middle tier of your cake.',
                placeholder: 'e.g., Soft pink with cascading sugar flowers...',
                loadingText: 'Adding tier 2...'
            },
            tier3: {
                icon: '\uD83C\uDF82',
                title: 'Design Tier 3 (Top)',
                description: 'Describe the top tier - the smallest layer.',
                placeholder: 'e.g., Gold-brushed white with delicate piping...',
                loadingText: 'Completing tier 3...'
            },
            topper: {
                icon: '\uD83D\uDC51',
                title: 'Design Your Cake Topper',
                description: 'Describe the topper that will crown your cake.',
                placeholder: 'e.g., A fondant T-Rex fighting a velociraptor for a dinosaur-themed party...',
                loadingText: 'Crafting your topper...'
            },
            writing_board: {
                icon: '\u270D\uFE0F',
                title: 'Writing on Cakeboard',
                description: 'What text should appear on the cakeboard?',
                placeholder: 'e.g., "Happy Birthday!" in pink cursive lettering on the board edge...',
                loadingText: 'Adding cakeboard text...'
            },
            writing_tier1: {
                icon: '\u270D\uFE0F',
                title: 'Writing on Tier 1',
                description: 'What text should appear on the bottom tier?',
                placeholder: 'e.g., "Alex" in bold blue fondant letters...',
                loadingText: 'Adding tier 1 text...'
            },
            writing_tier2: {
                icon: '\u270D\uFE0F',
                title: 'Writing on Tier 2',
                description: 'What text should appear on the middle tier?',
                placeholder: 'e.g., "Happy 5th Birthday" in elegant gold script...',
                loadingText: 'Adding tier 2 text...'
            },
            writing_tier3: {
                icon: '\u270D\uFE0F',
                title: 'Writing on Tier 3',
                description: 'What text should appear on the top tier?',
                placeholder: 'e.g., A number "5" in sparkly fondant...',
                loadingText: 'Adding tier 3 text...'
            }
        };

        // Bail early if core elements missing
        if (!quickSketchMode || !cakeBuilderMode) return;

        // Move builder overlay to body to escape transform containing block
        if (builderOverlay) document.body.appendChild(builderOverlay);

        // --- Overlay open / close ---

        function openBuilderOverlay() {
            if (!builderOverlay) return;
            builderOverlay.style.display = 'flex';
            builderOverlay.offsetHeight; // force reflow
            builderOverlay.classList.add('open');
            document.body.classList.add('builder-overlay-open');
            cakeBuilderMode.classList.add('active');
            quickSketchMode.classList.remove('active');
            cakeBuilderSection.classList.add('active');
            quickSketchSection.classList.remove('active');
            updateStepsPreview();
        }

        function closeBuilderOverlay() {
            if (!builderOverlay) return;
            builderOverlay.classList.remove('open');
            document.body.classList.remove('builder-overlay-open');
            setTimeout(function () {
                if (!builderOverlay.classList.contains('open')) {
                    builderOverlay.style.display = 'none';
                }
            }, 350);
            quickSketchMode.classList.add('active');
            cakeBuilderMode.classList.remove('active');
            quickSketchSection.classList.add('active');
            cakeBuilderSection.classList.remove('active');
        }

        quickSketchMode.addEventListener('click', function () { closeBuilderOverlay(); });
        cakeBuilderMode.addEventListener('click', function () { openBuilderOverlay(); });

        if (builderCloseBtn) builderCloseBtn.addEventListener('click', closeBuilderOverlay);
        if (builderBackLink) {
            builderBackLink.addEventListener('click', function (e) {
                e.preventDefault();
                closeBuilderOverlay();
            });
        }

        // ESC to close builder
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && builderOverlay && builderOverlay.classList.contains('open')) {
                closeBuilderOverlay();
            }
        });

        // --- Config change listeners ---

        [builderCakeboard, builderTiers, builderTopper].forEach(function (el) {
            if (el) el.addEventListener('change', updateStepsPreview);
        });

        builderWritingCheckboxes.forEach(function (cb) {
            cb.addEventListener('change', function () {
                var writingOption = cb.closest('.writing-option');
                var textInput = writingOption ? writingOption.querySelector('.writing-text-input') : null;

                if (cb.checked) {
                    if (writingOption) writingOption.classList.add('active');
                    if (textInput) { textInput.disabled = false; textInput.focus(); }
                } else {
                    if (writingOption) writingOption.classList.remove('active');
                    if (textInput) { textInput.disabled = true; textInput.value = ''; }
                }
                updateStepsPreview();
            });
        });

        // --- Step sequence building ---

        function updateStepsPreview() {
            currentSteps = buildStepSequence();
            if (!stepsPreviewList) return;
            stepsPreviewList.innerHTML = currentSteps.map(function (step, i) {
                return '<div class="preview-step"><span class="preview-step-num">' + (i + 1) + '</span> ' +
                    stepDefinitions[step].icon + ' ' +
                    stepDefinitions[step].title.replace('Design ', '').replace('Your ', '').replace('Add ', '') +
                    '</div>';
            }).join('');
        }

        function buildStepSequence() {
            var steps = [];

            if (builderCakeboard && builderCakeboard.value === 'premium') {
                steps.push('cakeboard');
            }

            var tierCount = builderTiers ? parseInt(builderTiers.value) : 1;
            for (var i = 1; i <= tierCount; i++) {
                steps.push('tier' + i);
            }

            if (builderTopper && builderTopper.value !== 'none') {
                steps.push('topper');
            }

            builderWritingCheckboxes.forEach(function (cb) {
                if (cb.checked) {
                    steps.push('writing_' + cb.value);
                }
            });

            return steps;
        }

        // --- Start Building ---

        if (startBuildingBtn) {
            startBuildingBtn.addEventListener('click', function () {
                currentSteps = buildStepSequence();
                currentStepIndex = 0;
                stepData = {};
                generatedImages = [];

                // Pre-populate writing steps with text from config inputs
                document.querySelectorAll('.writing-text-input').forEach(function (input) {
                    if (input.value.trim()) {
                        var writingKey = 'writing_' + input.dataset.writing;
                        stepData[writingKey] = input.value.trim();
                    }
                });

                if (builderConfig) builderConfig.classList.remove('active');
                if (builderSteps) builderSteps.classList.add('active');

                renderProgressDots();
                renderCurrentStep();
            });
        }

        function renderProgressDots() {
            if (!progressSteps) return;
            progressSteps.innerHTML = currentSteps.map(function (step, i) {
                var connector = i < currentSteps.length - 1 ? '<div class="progress-line"></div>' : '';
                return '<div class="progress-dot" data-index="' + i + '">' + (i + 1) + '</div>' + connector;
            }).join('');
        }

        function updateProgress() {
            if (!progressSteps) return;
            var dots = progressSteps.querySelectorAll('.progress-dot');
            var lines = progressSteps.querySelectorAll('.progress-line');

            dots.forEach(function (dot, i) {
                dot.classList.remove('active', 'completed');
                if (i < currentStepIndex) {
                    dot.classList.add('completed');
                    dot.innerHTML = '\u2713';
                } else if (i === currentStepIndex) {
                    dot.classList.add('active');
                    dot.innerHTML = String(i + 1);
                } else {
                    dot.innerHTML = String(i + 1);
                }
            });

            lines.forEach(function (line, i) {
                line.classList.toggle('completed', i < currentStepIndex);
            });

            var percent = (currentStepIndex / currentSteps.length) * 100;
            if (progressFill) progressFill.style.width = percent + '%';
            if (progressLabel) progressLabel.textContent = 'Step ' + (currentStepIndex + 1) + ' of ' + currentSteps.length;
        }

        function renderCurrentStep() {
            var stepKey = currentSteps[currentStepIndex];
            var def = stepDefinitions[stepKey];

            if (stepIcon) stepIcon.textContent = def.icon;
            if (stepTitle) stepTitle.textContent = def.title;
            if (stepDescription) stepDescription.textContent = def.description;
            if (stepPrompt) { stepPrompt.placeholder = def.placeholder; stepPrompt.value = stepData[stepKey] || ''; }
            if (stepBackBtn) stepBackBtn.style.display = currentStepIndex > 0 ? 'flex' : 'none';

            if (currentStepContent) currentStepContent.style.display = 'block';
            if (stepLoading) stepLoading.style.display = 'none';
            if (stepResult) stepResult.style.display = 'none';
            if (stepError) stepError.style.display = 'none';

            updateProgress();
        }

        // --- Generate step (calls real Worker instead of mock) ---

        if (stepGenerateBtn) {
            stepGenerateBtn.addEventListener('click', async function () {
                var prompt = stepPrompt ? stepPrompt.value.trim() : '';
                if (prompt.length < 5) {
                    if (stepError) {
                        stepError.textContent = 'Please describe this element in a bit more detail.';
                        stepError.style.display = 'block';
                    }
                    return;
                }

                var stepKey = currentSteps[currentStepIndex];
                stepData[stepKey] = prompt;

                if (currentStepContent) currentStepContent.style.display = 'none';
                if (stepError) stepError.style.display = 'none';
                if (stepLoading) stepLoading.style.display = 'block';
                if (loadingText) loadingText.textContent = stepDefinitions[stepKey].loadingText;

                try {
                    var data = await callWorker(prompt, 'cake');

                    if (stepLoading) stepLoading.style.display = 'none';

                    if (data.error) {
                        if (stepError) {
                            stepError.textContent = data.error;
                            stepError.style.display = 'block';
                        }
                        if (currentStepContent) currentStepContent.style.display = 'block';
                    } else if (data.image) {
                        if (stepResult) stepResult.style.display = 'block';
                        if (stepResultImage) stepResultImage.src = data.image;

                        generatedImages[currentStepIndex] = {
                            stepKey: stepKey,
                            prompt: prompt,
                            image: data.image
                        };
                    }
                } catch (err) {
                    console.error('Builder step error:', err);
                    if (stepLoading) stepLoading.style.display = 'none';
                    if (stepError) {
                        stepError.textContent = 'Could not generate this element. Please try again!';
                        stepError.style.display = 'block';
                    }
                    if (currentStepContent) currentStepContent.style.display = 'block';
                }
            });
        }

        // Retry
        if (stepRetryBtn) {
            stepRetryBtn.addEventListener('click', function () {
                if (stepResult) stepResult.style.display = 'none';
                if (currentStepContent) currentStepContent.style.display = 'block';
            });
        }

        // Approve & continue
        if (stepApproveBtn) {
            stepApproveBtn.addEventListener('click', function () {
                currentStepIndex++;
                if (currentStepIndex >= currentSteps.length) {
                    showFinalResult();
                } else {
                    renderCurrentStep();
                }
            });
        }

        // Back
        if (stepBackBtn) {
            stepBackBtn.addEventListener('click', function () {
                if (currentStepIndex > 0) {
                    currentStepIndex--;
                    renderCurrentStep();
                }
            });
        }

        // --- Final result ---

        function showFinalResult() {
            if (builderSteps) builderSteps.classList.remove('active');
            if (builderResult) builderResult.classList.add('active');

            var lastImage = generatedImages[generatedImages.length - 1];
            if (lastImage) {
                if (finalCakeImage) finalCakeImage.src = lastImage.image;
                if (builderDownloadImg) builderDownloadImg.href = lastImage.image;
            }

            displayFinalPalette();
            displaySpecList();
        }

        function displayFinalPalette() {
            if (!finalColorSwatches) return;
            // If we have a real image, extract palette from it; otherwise use brand colors
            var lastImage = generatedImages[generatedImages.length - 1];
            if (lastImage && lastImage.image && lastImage.image.startsWith('data:image/png')) {
                extractColorPalette(lastImage.image, 'finalColorSwatches');
            } else {
                var mockColors = ['#EC268F', '#FFC532', '#FFB6C1', '#DDA0DD', '#87CEEB'];
                finalColorSwatches.innerHTML = mockColors.map(function (color) {
                    return '<div class="color-swatch" style="background:' + color + '" title="Click to copy: ' + color + '" data-color="' + color + '">' +
                        '<span class="swatch-label">' + color + '</span></div>';
                }).join('');

                finalColorSwatches.querySelectorAll('.color-swatch').forEach(function (swatch) {
                    swatch.addEventListener('click', function () {
                        var c = swatch.dataset.color;
                        navigator.clipboard.writeText(c).then(function () {
                            var lbl = swatch.querySelector('.swatch-label');
                            var orig = lbl.textContent;
                            lbl.textContent = 'Copied!';
                            setTimeout(function () { lbl.textContent = orig; }, 1500);
                        });
                    });
                });
            }
        }

        function displaySpecList() {
            if (!specList) return;
            specList.innerHTML = generatedImages.map(function (item) {
                var def = stepDefinitions[item.stepKey];
                return '<div class="spec-item"><span class="spec-item-icon">' + def.icon + '</span>' +
                    '<div class="spec-item-content"><div class="spec-item-label">' +
                    def.title.replace('Design ', '').replace('Your ', '').replace('Add ', '') +
                    '</div><div class="spec-item-value">' + item.prompt + '</div></div></div>';
            }).join('');
        }

        // Start over
        if (builderStartOver) {
            builderStartOver.addEventListener('click', function () {
                if (builderResult) builderResult.classList.remove('active');
                if (builderConfig) builderConfig.classList.add('active');
                currentStepIndex = 0;
                stepData = {};
                generatedImages = [];
            });
        }

        // Builder PDF
        if (builderDownloadPdf) {
            builderDownloadPdf.addEventListener('click', function () {
                ensureJsPDF(function () { generateBuilderPDF(generatedImages, stepDefinitions); });
            });
        }

        // --- Builder particles ---

        function initBuilderParticles() {
            var canvas = document.getElementById('builderParticles');
            if (!canvas) return;

            var ctx = canvas.getContext('2d');
            var container = canvas.parentElement;

            function resize() {
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
            }
            resize();
            window.addEventListener('resize', resize);

            var particles = [];
            var particleCount = 30;

            function Particle() {
                this.reset();
            }
            Particle.prototype.reset = function () {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.4 + 0.1;
            };
            Particle.prototype.update = function () {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            };
            Particle.prototype.draw = function () {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, ' + this.opacity + ')';
                ctx.fill();
            };

            for (var i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(function (p) { p.update(); p.draw(); });

                for (var i = 0; i < particles.length; i++) {
                    for (var j = i + 1; j < particles.length; j++) {
                        var dx = particles[i].x - particles[j].x;
                        var dy = particles[i].y - particles[j].y;
                        var distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < 100) {
                            ctx.beginPath();
                            ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.05 * (1 - distance / 100)) + ')';
                            ctx.lineWidth = 0.5;
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                }

                requestAnimationFrame(animate);
            }
            animate();
        }

        // Watch for builder section becoming active to init particles
        if (cakeBuilderSection) {
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.target.classList.contains('active') && mutation.target.id === 'cakeBuilderSection') {
                        initBuilderParticles();
                        observer.disconnect();
                    }
                });
            });
            observer.observe(cakeBuilderSection, { attributes: true, attributeFilter: ['class'] });
        }

        // Initial preview
        updateStepsPreview();
    }

    // =========================================================
    // SHARED — Builder PDF
    // =========================================================

    function generateBuilderPDF(generatedImages, stepDefinitions) {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF();
        var pageWidth = doc.internal.pageSize.getWidth();
        var margin = 20;

        // Header
        doc.setFillColor(26, 26, 46);
        doc.rect(0, 0, pageWidth, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('My Baking Creations', margin, 22);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Custom Cake Design - Built with Cake Builder', margin, 30);

        doc.setTextColor(0, 0, 0);
        var yPos = 50;

        // Specs
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Design Specifications', margin, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        generatedImages.forEach(function (item) {
            var def = stepDefinitions[item.stepKey];
            var label = def.title.replace('Design ', '').replace('Your ', '').replace('Add ', '');
            doc.setFont('helvetica', 'bold');
            doc.text(def.icon + ' ' + label + ':', margin, yPos);
            doc.setFont('helvetica', 'normal');
            var splitText = doc.splitTextToSize(item.prompt, pageWidth - 2 * margin - 10);
            doc.text(splitText, margin + 5, yPos + 5);
            yPos += 10 + (splitText.length * 5);
        });

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('Design generated with Cake Builder by My Baking Creations', margin, 280);
        doc.text('mybakingcreations.com | (415) 568-8060', margin, 286);

        doc.save('my-custom-cake-design.pdf');
    }

    // =========================================================
    // SPIN ANIMATION (inject once)
    // =========================================================

    (function () {
        var style = document.createElement('style');
        style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    })();

    // =========================================================
    // BOOT — run the right init based on context
    // =========================================================

    if (isStandalone) {
        initSketcherStandalone();
        initCakeBuilder();
    } else if (isWidget) {
        initSketcherWidget();
        // The product_type radio listener that shows/hides the widget stays
        // in order-form.html inline script (NOT in this file).
    }

})();
