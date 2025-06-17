(function(Scratch) {
    'use strict';
  
    if (!Scratch.extensions.unsandboxed) {
      throw new Error('OmegaCore must be run in unsandboxed mode.');
    }
  
    class OmegaCore {
      constructor() {
        this.cells = {};
        this.setupCanvas();
      }
  
      setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '999';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.id = 'omegaCoreCanvas';
  
        const stageWrapper = document.querySelector('.stage_canvas_wrapper__1ZPS2') || document.querySelector('.stage-wrapper') || document.querySelector('canvas')?.parentNode;
        if (stageWrapper) {
          stageWrapper.appendChild(this.canvas);
          this.ctx = this.canvas.getContext('2d');
        } else {
          console.warn('Failed to attach canvas. Stage wrapper not found.');
        }
      }
  
      clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
      }
  
      generateCell(x, y, resolution, index, blocksLight) {
        const size = parseInt(resolution);
        this.cells[index] = {
          x: parseInt(x),
          y: parseInt(y),
          resolution: size,
          luminance: 0,
          blocksLight: (blocksLight === 'true' || blocksLight === true)
        };
      }
  
      moveCell(index, x, y) {
        if (this.cells[index]) {
          this.cells[index].x = parseInt(x);
          this.cells[index].y = parseInt(y);
        }
      }
  
      swapCells(i1, i2) {
        const temp = this.cells[i1];
        this.cells[i1] = this.cells[i2];
        this.cells[i2] = temp;
      }
  
      generateCellsFromList(list) {
        for (const entry of list) {
          const [x, y, res, index, blocksLight] = entry;
          this.generateCell(x, y, res, index, blocksLight);
        }
      }
  
      setLuminanceByIndex(index, lum) {
        if (this.cells[index]) {
          this.cells[index].luminance = this.clamp(parseFloat(lum), 0, 1);
        }
      }
  
      setLuminanceByCoord(x, y, lum) {
        for (const cell of Object.values(this.cells)) {
          if (cell.x === parseInt(x) && cell.y === parseInt(y)) {
            cell.luminance = this.clamp(parseFloat(lum), 0, 1);
          }
        }
      }
  
      removeAllLights() {
        for (const cell of Object.values(this.cells)) {
          cell.luminance = 0;
        }
      }
  
      drawCells() {
        if (!this.ctx) return;
  
        const canvasWidth = this.canvas.offsetWidth;
        const canvasHeight = this.canvas.offsetHeight;
  
        // Set pixel resolution to match display size
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
  
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
        for (const cell of Object.values(this.cells)) {
          const l = Math.floor(cell.luminance * 255);
          this.ctx.fillStyle = `rgb(${l},${l},${l})`;
  
          const halfSize = cell.resolution / 2;
  
          const drawX = (cell.x + 240) * (canvasWidth / 480) - halfSize;
          const drawY = (180 - cell.y) * (canvasHeight / 360) - halfSize;
  
          this.ctx.fillRect(drawX, drawY, cell.resolution, cell.resolution);
        }
      }
    }
  
    Scratch.extensions.register(new class {
      constructor() {
        this.core = new OmegaCore();
      }
  
      getInfo() {
        return {
          id: 'omegacore',
          name: 'ΩCore',
          color1: '#000000',
          color2: '#440000',
          color3: '#FF0000',
          blocks: [
            {
              opcode: 'clamp',
              blockType: Scratch.BlockType.REPORTER,
              text: 'clamp [NUM] between [MIN] and [MAX]',
              arguments: {
                NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                MIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                MAX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 255 }
              }
            },
            {
              opcode: 'generateCell',
              blockType: Scratch.BlockType.COMMAND,
              text: 'generate cell [X] [Y] [RES] [INDEX] blocks light? [BLOCKS]',
              arguments: {
                X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                RES: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
                INDEX: { type: Scratch.ArgumentType.STRING, defaultValue: 'cell1' },
                BLOCKS: {
                  type: Scratch.ArgumentType.STRING,
                  menu: 'booleanMenu',
                  defaultValue: 'true'
                }
              }
            },
            {
              opcode: 'moveCell',
              blockType: Scratch.BlockType.COMMAND,
              text: 'move cell [INDEX] to [X] [Y]',
              arguments: {
                INDEX: { type: Scratch.ArgumentType.STRING, defaultValue: 'cell1' },
                X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
              }
            },
            {
              opcode: 'swapCells',
              blockType: Scratch.BlockType.COMMAND,
              text: 'swap cells [INDEX1] [INDEX2]',
              arguments: {
                INDEX1: { type: Scratch.ArgumentType.STRING, defaultValue: 'cell1' },
                INDEX2: { type: Scratch.ArgumentType.STRING, defaultValue: 'cell2' }
              }
            },
            {
              opcode: 'generateCellsFromList',
              blockType: Scratch.BlockType.COMMAND,
              text: 'generate cells from [LIST]',
              arguments: {
                LIST: { type: Scratch.ArgumentType.LIST, defaultValue: 'my list' }
              }
            },
            {
              opcode: 'setLuminanceByIndex',
              blockType: Scratch.BlockType.COMMAND,
              text: 'set cell with [INDEX]\'s luminance to [LUM]',
              arguments: {
                INDEX: { type: Scratch.ArgumentType.STRING, defaultValue: 'cell1' },
                LUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
              }
            },
            {
              opcode: 'setLuminanceByCoord',
              blockType: Scratch.BlockType.COMMAND,
              text: 'set cell at [X] [Y]\'s luminance to [LUM]',
              arguments: {
                X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                LUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
              }
            },
            {
              opcode: 'removeAllLights',
              blockType: Scratch.BlockType.COMMAND,
              text: 'remove all lights',
              arguments: {}
            },
            {
              opcode: 'drawCells',
              blockType: Scratch.BlockType.COMMAND,
              text: 'draw cells',
              arguments: {}
            }
          ],
          menus: {
            booleanMenu: {
              acceptReporters: false,
              items: ['true', 'false']
            }
          }
        };
      }
  
      clamp(args) {
        return this.core.clamp(args.NUM, args.MIN, args.MAX);
      }
      generateCell(args) {
        this.core.generateCell(args.X, args.Y, args.RES, args.INDEX, args.BLOCKS);
      }
      moveCell(args) {
        this.core.moveCell(args.INDEX, args.X, args.Y);
      }
      swapCells(args) {
        this.core.swapCells(args.INDEX1, args.INDEX2);
      }
      generateCellsFromList(args) {
        const listObj = Scratch.vm.runtime.getTargetForStage().lookupOrCreateList(args.LIST);
        this.core.generateCellsFromList(listObj.value);
      }
      setLuminanceByIndex(args) {
        this.core.setLuminanceByIndex(args.INDEX, args.LUM);
      }
      setLuminanceByCoord(args) {
        this.core.setLuminanceByCoord(args.X, args.Y, args.LUM);
      }
      removeAllLights() {
        this.core.removeAllLights();
      }
      drawCells() {
        this.core.drawCells();
      }
    });
  })(Scratch);
  