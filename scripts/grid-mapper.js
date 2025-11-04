Hooks.once('init', () => {
  console.log('Grid Size Mapper | Initializing');
});

Hooks.on('getSceneControlButtons', (controls) => {
  const scenes = controls.find((c) => c.name === 'token') || controls[0];
  if (!scenes) return;

  const tool = {
    name: 'grid-size-mapper',
    title: 'Set Grid by Counts',
    icon: 'fa-solid fa-border-all',
    button: true,
    onClick: () => openGridCountDialog()
  };

  scenes.tools.push(tool);
});

async function openGridCountDialog(targetScene) {
  const scene = targetScene ?? canvas?.scene;
  if (!scene) {
    ui.notifications.warn('No active scene.');
    return;
  }

  const content = `
    <form>
      <div class="form-group">
        <label>Horizontal grids (columns)</label>
        <input type="number" name="cols" min="1" step="1" value="${Math.max(1, Math.round((scene.width || 1000) / (scene.grid || 100)))}"/>
      </div>
      <div class="form-group">
        <label>Vertical grids (rows)</label>
        <input type="number" name="rows" min="1" step="1" value="${Math.max(1, Math.round((scene.height || 1000) / (scene.grid || 100)))}"/>
      </div>
      <p class="notes">Uses the scene background image's pixel size to compute grid size.</p>
    </form>
  `;

  new Dialog({
    title: 'Set Grid by Counts',
    content,
    buttons: {
      apply: {
        label: 'Apply',
        icon: '<i class="fas fa-check"></i>',
        callback: async (html) => {
          const cols = parseInt(html.find('[name="cols"]').val());
          const rows = parseInt(html.find('[name="rows"]').val());
          if (!cols || !rows || cols <= 0 || rows <= 0) {
            ui.notifications.error('Please enter valid positive integers for rows and columns.');
            return;
          }
          await computeAndApplyGridFromCounts(scene, cols, rows);
        }
      },
      cancel: {
        label: 'Cancel'
      }
    },
    default: 'apply'
  }).render(true);
}

async function loadImageDimensions(src) {
  return new Promise((resolve, reject) => {
    if (!src) return reject(new Error('No background image set on the scene.'));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    img.onerror = (e) => reject(new Error('Failed to load background image.'));
    img.src = src;
  });
}

function getSceneBackgroundSrc(scene) {
  // Try multiple properties for cross-version compatibility
  return (
    scene?.background?.src ||
    scene?.data?.background?.src ||
    scene?.img ||
    scene?.data?.img ||
    null
  );
}

async function computeAndApplyGridFromCounts(scene, cols, rows) {
  const src = getSceneBackgroundSrc(scene);
  if (!src) {
    ui.notifications.error('The scene has no background image. Set a background first.');
    return;
  }

  let dims;
  try {
    dims = await loadImageDimensions(src);
  } catch (err) {
    console.error(err);
    ui.notifications.error('Could not read background image dimensions.');
    return;
  }

  const { width: imgW, height: imgH } = dims;
  if (!imgW || !imgH) {
    ui.notifications.error('Background image has invalid dimensions.');
    return;
  }

  const gridW = Math.floor(imgW / cols);
  const gridH = Math.floor(imgH / rows);
  const gridSize = Math.max(1, Math.min(gridW, gridH));

  const newWidth = cols * gridSize;
  const newHeight = rows * gridSize;

  try {
    await scene.update({ width: newWidth, height: newHeight, grid: gridSize });
    ui.notifications.info(`Grid set to ${gridSize}px; scene size ${newWidth}×${newHeight}.`);
  } catch (e) {
    console.error(e);
    ui.notifications.error('Failed to update scene.');
  }
}

// Inject a button into the Scene Config, beside Grid Type
Hooks.on('renderSceneConfig', (app, html) => {
  try {
    const sceneDoc = app.document || app.object || canvas?.scene;
    if (!sceneDoc) return;

    const selectEl = html.find('select[name="grid.type"]');
    if (!selectEl.length) return;

    const btn = $(`
      <button type="button" class="grid-mapper-btn" style="margin-left: 6px;">
        <i class="fa-solid fa-border-all"></i>
      </button>
    `);

    btn.attr('title', 'Set Grid by Counts');
    btn.on('click', () => openGridCountDialog(sceneDoc));

    selectEl.after(btn);
  } catch (err) {
    console.error('Grid Size Mapper | Failed to inject button into Scene Config', err);
  }
});


