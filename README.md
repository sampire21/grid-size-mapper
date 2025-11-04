# Grid Size Mapper (Foundry VTT Module)

Set a scene's grid by entering how many grid squares your battlemap has horizontally and vertically. The module reads the background image's pixel dimensions, computes the grid size, and updates the scene accordingly.

## Install

1. Copy this folder to your Foundry `Data/modules/` directory. The folder name should be `grid-size-mapper`.
2. In Foundry, go to "Add-on Modules" and enable "Grid Size Mapper" for your World.

Alternatively, host the `module.json` somewhere and install via manifest URL.

## Usage

- Open a scene with a background image set.
- Click the Scene Controls toolbar button with the border icon ("Set Grid by Counts").
- Enter the number of grid squares horizontally (columns) and vertically (rows).
- Click Apply. The module will:
  - Load the background image to read its pixel size
  - Compute grid size as min(imageWidth/cols, imageHeight/rows)
  - Update the scene `grid`, `width`, and `height` to match an integer multiple of that grid size

Notes:
- Ensure the scene has a background image set first.
- Works with Foundry VTT v11–v13. Some APIs changed across versions; this module includes fallbacks for common properties.

## License

MIT

