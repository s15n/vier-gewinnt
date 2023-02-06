class Field {
    constructor() {
        this.field = new Uint8Array(7*6);
        this.streaks = new Uint8Array(2*4*7*6);
        this.won = new Uint8Array(3);
    }

    // (int, bool) -> bool
    input(column, firstPlayer) {
        const row = this.inputLoc(column, firstPlayer);
        if (row === -1)
            return false;
        
        const pi = firstPlayer ? 0 : 1;

        // dir: right
        for (let c = column; c >= 0; --c) {
            if (c === column || this.streaks[pi*4*7*6 + 0 + c*6 + row] !== 0) {
                const s = c === 6 ? 1 : (this.streaks[pi*4*7*6 + 0 + (c+1)*6 + row] + 1);
                this.streaks[pi*4*7*6 + 0 + c*6 + row] = s;
                if (s >= 4)
                    this.trySetWin(pi + 1, 0, c, row);
                //console.warn(s, c, row, pi*4*7*6 + 0 + c*6 + row, this.streaks[pi*4*7*6 + 0 + c*6 + row], this.streaks[pi*4*7*6 + 0 + (c+1)*6 + row]);
            }
        }
        // dir: up
        for (let r = row; r >= 0; --r) {
            if (r === row || this.streaks[pi*4*7*6 + 1*7*6 + column*6 + r] !== 0) {
                const s = r === 5 ? 1 : (this.streaks[pi*4*7*6 + 1*7*6 + column*6 + (r+1)] + 1);
                this.streaks[pi*4*7*6 + 1*7*6 + column*6 + r] = s;
                if (s >= 4)
                    this.trySetWin(pi + 1, 0, column, r);
            }
        }
        // dir: up right
        let dia = row < column ? row : column;
        let dr = row - dia;
        let dc = column - dia;
        for (let d = dia; d >= 0; --d) {
            const i = (dc+d)*6 + (dr+d);
            if (d === dia || this.streaks[pi*4*7*6 + 2*7*6 + i] !== 0) {
                const s = (dc+d === 6 || dr+d === 5) ? 1 : (this.streaks[pi*4*7*6 + 2*7*6 + (dc+d+1)*6 + (dr+d+1)] + 1);
                this.streaks[pi*4*7*6 + 2*7*6 + i] = s;
                if (s >= 4)
                    this.trySetWin(pi + 1, 0, i/6, i%6);
            }
        }
        // dir: up left
        const ic = 6 - column;
        dia = row < ic ? row : ic;
        dr = row - dia;
        dc = 6 - (ic - dia);
        for (let d = dia; d >= 0; --d) {
            const i = (dc-d)*6 + (dr+d);
            if (d === dia || this.streaks[pi*4*7*6 + 3*7*6 + i] !== 0) {
                const s = (dc-d === 6 || dr+d === 5) ? 1 : (this.streaks[pi*4*7*6 + 3*7*6 + (dc-d-1)*6 + (dr+d+1)] + 1);
                this.streaks[pi*4*7*6 + 3*7*6 + i] = s;
                if (s >= 4)
                    this.trySetWin(pi + 1, 0, i/6, i%6);
            }
        }

        return true;
    }

    // (int, bool) -> int
    inputLoc(column, firstPlayer) {
        if (this.field[column*6 + 5] !== 0)
            return -1;
        for (let r = 0; true; ++r) {
            if (this.field[column * 6 + r] === 0) {
                this.field[column * 6 + r] = firstPlayer ? 1 : 2;
                return r;
            }
        }
    }

    // (int, int, int, int) -> void
    trySetWin(pi, dir, column, row) {
        //console.log("TRY SET WIN ", pi);
        if (this.won[0] == 0) {
            this.won[0] = pi;
            this.won[1] = dir;
            this.won[2] = column*6 + row;
        }
    }

    // () -> int
    hasWon() {
        return this.won[0];
    }

    // (int) -> float
    rate(player) {
        if (this.won[0] != 0) {
            if (this.won[0] === player + 1)
                return Infinity
            else
                return -Infinity
        }

        let sum = 0.0;
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 7*6; ++j) {
                if (i === 2) {
                    const s = 6 - j/6 + j%6;
                    if (s >= 9 || s <= 2)
                        continue;
                } else if (i === 3) {
                    const s = j/6 + j%6;
                    if (s >= 9 || s <= 2)
                        continue;
                } else if (i === 1 && j%6 >= 3) {
                    continue;
                }

                let add = this.weighStreak(this.streaks[player*4*7*6 + i*7*6 + j]);
                if (i === 0 && (j/6 < 2 || j/6 > 4))
                    add *= (j/6 < 2) ? (j/6+1)/3.0 : (7-j/6)/3.0;
                sum += add;
            }
        }
        return sum;
    }

    // (int) -> float
    weighStreak(s) {
        return s === 1 ? 0.6 : s === 2 ? 1.0 : s;
    }

    // () -> Field
    clone() {
        const f = new Field();
        for (let i = 0; i < this.field.length; ++i)
            f.field[i] = this.field[i];
        for (let i = 0; i < this.streaks.length; ++i)
            f.streaks[i] = this.streaks[i];
        for (let i = 0; i < this.won.length; ++i)
            f.won[i] = this.won[i];
        return f;
    }

    // (Div, int) -> void
    print(gameField, lastColumn) {
        let doneLC = false;

        for (let row = 6 - 1; row >= 0; --row) {
            for (let col = 0; col < 7; ++col) {
                const index = 18 * (6 - 1 - row) + 3 + 2 * col;
                //console.log(index, row, col);
                const child = gameField.children[index];

                const b = this.field[col*6+row];

                //console.log(index, row, col);
                child.textContent = b == 0 ? "\u00a0" : b == 1 ? "X" : "O";
                child.style.color = b == 1 ? "#FA3D20" : "#F8C813";

                if (!doneLC && col == lastColumn && b != 0) {
                    doneLC = true;
                    child.style.textDecoration = "underline";
                } else {
                    child.style.textDecoration = "none";
                }
            }
        }
    }
}