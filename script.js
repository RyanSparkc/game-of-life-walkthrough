/**
 * 康威生命遊戲的實現
 * @class GameOfLife
 */
class GameOfLife {
    /** @type {Object} 遊戲配置常量 */
    static CONFIG = {
        CELL_SIZE: 10,
        CELL_RADIUS: 2,
        UPDATE_INTERVAL: 500,
        COLORS: {
            LEVEL1: '#9be9a8',
            LEVEL2: '#40c463',
            LEVEL3: '#30a14e',
            LEVEL4: '#216e39'
        }
    };

    /**
     * @constructor
     * @param {string} canvasId - Canvas元素的ID
     */
    constructor(canvasId) {
        this.setupCanvas(canvasId);
        this.bindProperties();
        this.initialize();
    }

    /**
     * 設置Canvas元素
     * @private
     */
    setupCanvas(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        const { CELL_SIZE } = GameOfLife.CONFIG;
        this.COLS = Math.floor(this.canvas.width / CELL_SIZE);
        this.ROWS = Math.floor(this.canvas.height / CELL_SIZE);
    }

    /**
     * 綁定實例屬性
     * @private
     */
    bindProperties() {
        this.isRunning = false;
        this.timer = null;
    }

    /**
     * 初始化遊戲
     * @private
     */
    initialize() {
        this.initGrid();
        this.initControls();
    }

    /**
     * 初始化網格
     * @private
     */
    initGrid() {
        this.grid = Array(this.ROWS).fill()
            .map(() => Array(this.COLS).fill()
                .map(() => Math.random() > 0.7));
    }

    /**
     * 初始化控制
     * @private
     */
    initControls() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('clearBtn').addEventListener('click', () => this.clear());
        document.getElementById('randomBtn').addEventListener('click', () => this.randomize());
    }

    /**
     * 計算指定細胞周圍的存活鄰居數量。
     *
     * 此方法檢查指定細胞（row, col）周圍的所有八個可能的鄰居，
     * 並在環形數組中（即網格在邊緣處環繞）進行檢查。
     * 每找到一個存活的鄰居就遞增計數。
     *
     * @param {number} row - 細胞的行索引。
     * @param {number} col - 細胞的列索引。
     * @returns {number} 指定細胞周圍的存活鄰居數量。
     */
    countNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = (row + i + this.ROWS) % this.ROWS;
                const newCol = (col + j + this.COLS) % this.COLS;
                if (this.grid[newRow][newCol]) count++;
            }
        }
        return count;
    }

    /**
     * 計算下一代
     * @private
     */
    nextGeneration() {
        const newGrid = this.grid.map(arr => [...arr]);
        
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                const neighbors = this.countNeighbors(row, col);
                const isAlive = this.grid[row][col];
                newGrid[row][col] = this.calculateNewState(isAlive, neighbors);
            }
        }
        
        this.grid = newGrid;
    }

    /**
     * 計算細胞新狀態
     * @private
     * @param {boolean} isAlive - 當前是否存活
     * @param {number} neighbors - 鄰居數量
     * @returns {boolean} 新的存活狀態
     */
    calculateNewState(isAlive, neighbors) {
        return isAlive ? 
            (neighbors === 2 || neighbors === 3) : 
            (neighbors === 3);
    }

    /**
     * 繪製網格
     * @private
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (this.grid[row][col]) {
                    const neighbors = this.countNeighbors(row, col);
                    this.ctx.fillStyle = neighbors <= 2 ? GameOfLife.CONFIG.COLORS.LEVEL1 :
                                       neighbors === 3 ? GameOfLife.CONFIG.COLORS.LEVEL2 :
                                       neighbors === 4 ? GameOfLife.CONFIG.COLORS.LEVEL3 :
                                       GameOfLife.CONFIG.COLORS.LEVEL4;

                    const x = col * GameOfLife.CONFIG.CELL_SIZE;
                    const y = row * GameOfLife.CONFIG.CELL_SIZE;
                    this.ctx.beginPath();
                    this.ctx.roundRect(x, y, GameOfLife.CONFIG.CELL_SIZE-1, GameOfLife.CONFIG.CELL_SIZE-1, GameOfLife.CONFIG.CELL_RADIUS);
                    this.ctx.fill();
                }
            }
        }
    }

    /**
     * 控制方法
     * @public
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.update();
        }
    }

    pause() {
        this.isRunning = false;
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    clear() {
        this.grid = Array(this.ROWS).fill()
            .map(() => Array(this.COLS).fill(false));
        this.draw();
    }

    randomize() {
        this.initGrid();
        this.draw();
    }

    /**
     * 遊戲更新循環
     * @private
     */
    update() {
        if (!this.isRunning) return;
        
        this.draw();
        this.nextGeneration();
        this.timer = setTimeout(
            () => this.update(), 
            GameOfLife.CONFIG.UPDATE_INTERVAL
        );
    }
}

// 初始化遊戲實例
const game = new GameOfLife('gameCanvas');
game.draw();
