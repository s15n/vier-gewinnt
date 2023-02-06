class Player {
    // (bool)
    constructor(first) {
        this.first = first;
        this.lastTurn = -1;
    }

    // (Field, int, Div, Callback) -> void
    //turn(field, turn, gameDiv);
}

class RealPlayer extends Player {
    // (bool)
    constructor(first) {
        super(first);
    }

    // (Field, int, Div, Callback) -> void
    turn(field, turn, gameDiv, then) {
        gameDiv.children[0].textContent = "Du bist am Zug!";

        gameDiv.buttonEvent = (e) => {
            console.log("Button");
            this._turn(field, Number(e.target.textContent) - 1, then);
            //gameDiv.enableButtons(false);
        };

        gameDiv.enableButtons(true);
    }

    // (Field, int, Callback) -> void
    _turn(field, col, then) {
        //console.log(col);
        this.lastTurn = col;
        field.input(col, this.first);
        then();
    }
}

class AIPlayer extends Player {
    constructor(first, difficulty) {
        super(first);
        this.difficulty = difficulty;
    }

    turn(field, turn, gameDiv, then) {
        console.log("KI!");
        gameDiv.children[0].textContent = "Die KI ist am Zug!";

        if (turn == 1) {
            field.input(3, this.first);
            then();
            return;
        }

        const s = this.simulateTurn(field, this.difficulty);
        console.log(s);

        let best = -1;
        let bestV = -Infinity;
        for (let c = 0; c < 7; ++c) {
            if (s[c*2+0] === Infinity) {
                bestV = Infinity;
                best = c;
                break;
            }
            if (s[c*2+1] === -Infinity || Number.isNaN(s[c*2+0]))
                continue;
            const r = s[c*2+0] - s[c*2+1];
            if (r > bestV) {
                bestV = r;
                best = c;
            }
            if (r === bestV && Math.random() >= 0.5)
                best = c;
        }
        
        if (best === -1) {
            for (let i = 0; i < 7; ++i) {
                const c = i % 2 === 0 ? 3 + i/2 : 3 - i/2;
                if (s[c*2+0] != -Infinity && !Number.isNaN(s[c*2+0]))
                    best = c;
            }
            if (best === -1) {
                for (let i = 0; i < 7; ++i) {
                    if (!Number.isNaN(s[i*2+0]))
                        best = i;
                }
            }
        }

        console.log(bestV);

        this.lastTurn = best;
        field.input(best, this.first);

        then();
    }

    simulateTurn(field, depth) {
        const results = new Float32Array(7*2);
        for (let c = 0; c < 7; ++c) {
            const f = field.clone();
            if (!f.input(c, this.first)) {
                results[c*2+0] = NaN;
                results[c*2+1] = NaN;
                continue;
            }

            let sum0 = 0.0;
            let sum1 = 0.0;
            let div = 7;
            for (let c2 = 0; c2 < 7; ++c2) {
                const f2 = f.clone();
                if (!f2.input(c2, !this.first)) {
                    --div;
                    continue;
                }

                if (depth === 1) {
                    sum0 += f2.rate(0);
                    sum1 += f2.rate(1);
                } else {
                    const r2 = this.simulateTurn(f2, depth - 1);
                    //console.log(depth, r2);
                    let sum2S = 0.0;
                    let sum2O = 0.0;
                    let div2 = 7;
                    let hadPosInf = false;
                    let hadNegInf = false;

                    for (let r2i = 0; r2i < 7; ++r2i) {
                        if (r2[r2i*2+0] === Infinity) {
                            r2[r2i*2+0] = 0;
                            if (hadPosInf)
                                r2[r2i*2+0] = 1;
                            else
                                hadPosInf = true;
                        }
                        if (r2[r2i*2+1] === Infinity) r2[r2i*2+1] = 0;
                        if (r2[r2i*2+0] === -Infinity) {
                            r2[r2i*2+0] = -100;
                            if (hadNegInf) {
                                r2[r2i*2+0] = -1000;
                            } else {
                                hadNegInf = true;
                            }
                        }
                        if (r2[r2i*2+1] === -Infinity) r2[r2i*2+1] = -100;
                        if (Number.isNaN(r2[r2i*2+0])) {
                            r2[r2i*2+0] = 0;
                            r2[r2i*2+1] = 0;
                        }
                        sum2S += r2[r2i*2+0];
                        sum2O += r2[r2i*2+1];
                    }
                    sum2S /= div2;
                    sum2O /= div2;
                    sum0 += this.first ? sum2S : sum2O;
                    sum1 += this.first ? sum2O : sum2S;
                }
            }
            sum0 /= div;
            sum1 /= div;
            results[c*2+0] = this.first ? sum0 : sum1;
            results[c*2+1] = this.first ? sum1 : sum0;
        }
        return results;
    }
}