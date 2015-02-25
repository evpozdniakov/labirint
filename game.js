/* global console:false */
"use strict";

// click cells to draw path
// difficulty: draw bars mostly in the middle for the first time

// var rtbl = [];

function getRandomAimingCenter(max) {
	var r1 = Math.random(),     // 0 < r1 < 1
		r2 = Math.pow(r1, 0.75) / 2, // 0 < r2 < 0.5, r2 -> 0.5
		r3 = (r1.toString(2).charAt(30) == "1") ? r2 : 1 - r2, // 0 < r3 < 1, r3 -> 0.5
		r4 = Math.floor(r3 * max);
	// rtbl.push([r1, r2, r3, r4]);

	return r4;
}

/*$(function() {
	var z = 0;
	while(++z < 9999) {
		var r = getRandomAimingCenter(20);
		document.getElementById('test20-'+r).textContent+='|';
	}
	rtbl.sort(function(a,b) {
		return a[0] - b[0];
	});
	rtbl.unshift(['r1', 'r2', 'r3', 'r4']);

	console.table(rtbl);
});*/

/*var tbl = [['r1', 'r2', 'r3a', 'r3b', 'r4a', 'r4b']];
for (var r1 = 0.0001; r1 < 0.9999; r1+=0.005) {
	// var r1 = Math.random(),     // 0 < r1 < 1
	var r2 = Math.sqrt(r1) / 2, // 0 < r2 < 0.5, r2 -> 0.5
		r3a = r2, // 0 < r3 < 1, r3 -> 0.5
		r3b = 1 - r2, // 0 < r3 < 1, r3 -> 0.5
		r4a = Math.floor(r3a * 20),
		r4b = Math.floor(r3b * 20);

	tbl.push([r1, r2, r3a, r3b, r4a, r4b]);
}
console.table(tbl);*/

document.addEventListener('DOMContentLoaded', function(/*ev*/) {
	var lbrCells;
	var lbrCheckCells;
	var lbrW;
	var lbrH;
	var difficulty;
	var stopGenerateLoop;
	var currentCell;
	var farestCell;

	var stats = {
		bars: 0,
		fails: 0,
		consFails: 0,
		maxConsFails: 0
	};

	var ELE = {
		bars:         document.getElementById('lbrBars'),
		consFails:    document.getElementById('lbrConsFails'),
		displayWhile: document.getElementById('displayWhileGenerate'),
		difficulty:   document.getElementById('lbrDifficulty'),
		fails:        document.getElementById('lbrFails'),
		lbrBox:       document.getElementById('lbrBox'),
		size:         document.getElementById('lbrSize'),
		maxConsFails: document.getElementById('lbrMaxConsFails'),
		generateBtn:  document.getElementById('lbrGenerateBtn'),
		stopBtn:      document.getElementById('stopGenerateBtn')
	};

	init();

	function init() {
		ELE.generateBtn.addEventListener('click', lbrGenerate);
		ELE.stopBtn.addEventListener('click', stopGenerate);
	}

	function getCellIdByCoords(x, y) {
		return '_x' +x+ '_y' +y;
	}

	function lbrGenerate() {
		// console.log('---  lbr generate');
		var wh = ELE.size.value.split('x');
		lbrW = parseInt(wh[0]);
		lbrH = parseInt(wh[1]);

		currentCell = {
			x: Math.floor(lbrW / 2),
			y: lbrH - 1
		};

		lbrCells = new Array(lbrH);
		lbrCheckCells = new Array(lbrH);
		for (var y = 0; y < lbrH; y++) {

			var cellVal;
			var row = lbrCells[y] = new Array(lbrW);
			var checkRow = lbrCheckCells[y] = new Array(lbrW);
			for (var x = 0; x < lbrW; x++) {
				cellVal = 0;

				if (y === 0) {
					cellVal += 8;
				}
				else if (y+1 == lbrH) {
					cellVal += 2;
				}

				if (x === 0) {
					cellVal += 1;
				}
				else if (x+1 == lbrW) {
					cellVal += 4;
				}

				row[x] = cellVal;
				checkRow[x] = 0;
			}			

		}

		drawLbr();

		stats = {
			bars: 0,
			fails: 0,
			consFails: 0,
			maxConsFails: 0
		};

		difficulty = parseInt(ELE.difficulty.value, 10);

		ELE.generateBtn.disabled = true;
		ELE.stopBtn.disabled = false;

		var z = 0;
		while( !stopGenerateLoop && ++z < 99999 ) {
			addRandomBar();
		}

		// console.log('--- stop loop', z);
		if (!stopGenerateLoop) {
			stopGenerate();
		}
		stopGenerateLoop = false;
	}

	function addRandomBar() {
		var barPos1 = Math.pow(2, Math.floor(Math.random() * 4)); // 8 t, 4 r, 2 b, 1 l
		var x1 = getRandomAimingCenter(lbrW);
		var y1 = getRandomAimingCenter(lbrH);
		var cellVal = lbrCells[y1][x1];
		if (cellVal & barPos1) {
			// console.log('--- return if ', cellVal & barPos1);
			return;
		}
		var x2, y2, barPos2;
		switch(barPos1) {
			case 8:
				y2 = y1-1;
				x2 = x1;
				barPos2 = 2;
				break;
			case 4:
				y2 = y1;
				x2 = x1+1;
				barPos2 = 1;
				break;
			case 2:
				y2 = y1+1;
				x2 = x1;
				barPos2 = 8;
				break;
			case 1:
				y2 = y1;
				x2 = x1-1;
				barPos2 = 4;
				break;
		}

		var cellVal2 = lbrCells[y2][x2];

		if (cellVal + barPos1 == 15 || cellVal2 + barPos2 == 15) {
			stats.fails++;
			// ELE.fails.value = stats.fails;

			stats.consFails++;
			// ELE.consFails.value = stats.consFails;

			stats.maxConsFails = Math.max(stats.maxConsFails, stats.consFails);
			// ELE.maxConsFails.value = stats.maxConsFails;
			if (stats.maxConsFails == difficulty) {
				stopGenerate();
			}
		}
		else {
			lbrCells[y1][x1] += barPos1;
			lbrCells[y2][x2] += barPos2;

			if (!newLbrHasPath()) {
				lbrCells[y1][x1] -= barPos1;
				lbrCells[y2][x2] -= barPos2;
				return;
			}

			stats.consFails = 0; // ELE.consFails.value = consFails;
			stats.bars++; // ELE.bars.value = stats.bars;

			if (ELE.displayWhile.checked) {
				var cell1 = document.getElementById(getCellIdByCoords(x1, y1));
				var cell2 = document.getElementById(getCellIdByCoords(x2, y2));
				switch(barPos1) {
					case 8:
						cell1.style.borderTop = '1px solid black';
						cell2.style.borderBottom = '1px solid black';
						break;
					case 4:
						cell1.style.borderRight = '1px solid black';
						cell2.style.borderLeft = '1px solid black';
						break;
					case 2:
						cell1.style.borderBottom = '1px solid black';
						cell2.style.borderTop = '1px solid black';
						break;
					case 1:
						cell1.style.borderLeft = '1px solid black';
						cell2.style.borderRight = '1px solid black';
						break;
				}
			}
		}
	}

	function newLbrHasPath() {
		// console.log('--- newLbrHasPath');
		var currentStepCells,
			passingCellsCount = 0,
			nextStepCells     = [currentCell],
			x, y;

		// clear lbrCheckCells
		for (y = 0; y < lbrH; y++) {
			var row = lbrCheckCells[y];
			for (x = 0; x < lbrW; x++) {
				if (row[x] > 0) {
					row[x] = 0;
				}
			}
		}

		var z = 0;
		while (++z < 999) {
			currentStepCells = nextStepCells.slice(0);
			nextStepCells.length = 0;

			for (var i = 0, l = currentStepCells.length; i < l; i++) {
				var cell = currentStepCells[i];
				x = cell.x;
				y = cell.y;

				if (y === 0 || lbrCells[y][x] & 8) {
					// no top cell available
				}
				else if (lbrCheckCells[y-1][x] === 0) {
					nextStepCells.push({ x:x, y:y-1 });
					lbrCheckCells[y-1][x] = z;
					passingCellsCount++;
				}

				if (y + 1 == lbrH || lbrCells[y][x] & 2) {
					// no bottom cell available
				}
				else if (lbrCheckCells[y+1][x] === 0) {
					nextStepCells.push({ x:x, y:y+1 });
					lbrCheckCells[y+1][x] = z;
					passingCellsCount++;
				}

				if (x === 0 || lbrCells[y][x] & 1) {
					// no left cell available
				}
				else if (lbrCheckCells[y][x-1] === 0) {
					nextStepCells.push({ x:x-1, y:y });
					lbrCheckCells[y][x-1] = z;
					passingCellsCount++;
				}

				if (x + 1 == lbrW || lbrCells[y][x] & 4) {
					// no right cell available
				}
				else if (lbrCheckCells[y][x+1] === 0) {
					nextStepCells.push({ x:x+1, y:y });
					lbrCheckCells[y][x+1] = z;
					passingCellsCount++;
				}
			}

			if (nextStepCells.length === 0) {
				break;
			}
		}

		if (passingCellsCount < lbrW * lbrH) {
			return false;
		}

		farestCell = currentStepCells[0];
		farestCell.z = z;

		return true;
	}

	function stopGenerate() {
		// console.log('--- stop generate');
		stopGenerateLoop = true;
		
		ELE.generateBtn.disabled = false;
		ELE.stopBtn.disabled = true;
		ELE.bars.value = stats.bars;
		ELE.fails.value = stats.fails;
		ELE.consFails.value = stats.consFails;
		ELE.maxConsFails.value = stats.maxConsFails;
		
		drawLbr(true);
	}

	function tryToGoToCell(ev) {
		// console.log('--- tryToGoToCell', ev.type, ev.target);
		var elm = ev.target;
		var cell;
		if (elm.nodeName == 'TD') {
			var cellId = elm.getAttribute('id');
			var coords = cellId.substr(2).split('_y');
			var targetCell = { x:parseInt(coords[0],10), y:parseInt(coords[1],10) };
			var pathCells = getPathBetweenCells(currentCell, targetCell);
			if (pathCells.length) {
				for (var i = 0, l = pathCells.length; i < l; i++) {
					cell = pathCells[i];
					document.getElementById(getCellIdByCoords(cell.x, cell.y))
						.style.backgroundColor = '#cff';
				}
				setTimeout(function() {
					for (var i = 0, l = pathCells.length; i < l; i++) {
						cell = pathCells[i];
						document.getElementById(getCellIdByCoords(cell.x, cell.y))
							.style.backgroundColor = '#fff';
					}
					currentCell = cell;
					document.getElementById(getCellIdByCoords(currentCell.x, currentCell.y))
						.style.backgroundColor = '#cff';
				}, 250);
			}
		}
	}

	function getPathBetweenCells(cellFrom, cellTo) {
		// console.log('--- getPathBetweenCells', cellFrom, cellTo);
		var pathCells = [];
		var cell, x, y;
		var nextStepCells = [cellFrom];
		var currentStepCells = [];
		var cellToJson = JSON.stringify(cellTo);

		// clear lbrCheckCells
		for (y = 0; y < lbrH; y++) {
			var row = lbrCheckCells[y];
			for (x = 0; x < lbrW; x++) {
				if (row[x] > 0) {
					row[x] = 0;
				}
			}
		}

		console.log('--- looking for path');
		lookingForPath: {
			var z = 0;
			while (++z < 10) {
				currentStepCells = nextStepCells.slice(0);
				nextStepCells.length = 0;

				for (var i = 0, l = currentStepCells.length; i < l; i++) {
					cell = currentStepCells[i];
					x = cell.x;
					y = cell.y;

					if (y === 0 || lbrCells[y][x] & 8) {
						// no top cell available
					}
					else if (lbrCheckCells[y-1][x] === 0) {
						nextStepCells.push({ x:x, y:y-1 });
						lbrCheckCells[y-1][x] = z;
					}

					if (y + 1 == lbrH || lbrCells[y][x] & 2) {
						// no bottom cell available
					}
					else if (lbrCheckCells[y+1][x] === 0) {
						nextStepCells.push({ x:x, y:y+1 });
						lbrCheckCells[y+1][x] = z;
					}

					if (x === 0 || lbrCells[y][x] & 1) {
						// no left cell available
					}
					else if (lbrCheckCells[y][x-1] === 0) {
						nextStepCells.push({ x:x-1, y:y });
						lbrCheckCells[y][x-1] = z;
					}

					if (x + 1 == lbrW || lbrCells[y][x] & 4) {
						// no right cell available
					}
					else if (lbrCheckCells[y][x+1] === 0) {
						nextStepCells.push({ x:x+1, y:y });
						lbrCheckCells[y][x+1] = z;
					}
				}

				for (var i2 = 0, l2 = nextStepCells.length; i2 < l2; i2++) {
					cell = nextStepCells[i2];
					if (cellToJson == JSON.stringify(cell)) {
						// drawLbr(true);
						pathCells.push(cell);
						var cellZ = lbrCheckCells[cell.y][cell.x];
						while (--cellZ > 0) {
							var cellVal = lbrCells[cell.y][cell.x];
							if (cell.y > 0 && !(cellVal & 8) && lbrCheckCells[cell.y-1][cell.x] == cellZ) {
								cell = { x:cell.x, y:cell.y-1 };
								pathCells.push(cell);
							}
							else if (cell.y + 1 < lbrH && !(cellVal & 2) && lbrCheckCells[cell.y+1][cell.x] == cellZ) {
								cell = { x:cell.x, y:cell.y+1 };
								pathCells.push(cell);
							}
							else if (cell.x > 0 && !(cellVal & 1) && lbrCheckCells[cell.y][cell.x-1] == cellZ) {
								cell = { x:cell.x-1, y:cell.y };
								pathCells.push(cell);
							}
							else if (cell.x + 1 < lbrW && !(cellVal & 4) && lbrCheckCells[cell.y][cell.x+1] == cellZ) {
								cell = { x:cell.x+1, y:cell.y };
								pathCells.push(cell);
							}
							else {
								console.log('--- SOMETHING GOES WRONG ---');
							}
						}
						pathCells.push(currentCell);
						break lookingForPath;
					}
				}
			}
		}

		return pathCells.reverse();
	}

	function drawLbr(force) {
		var table = document.createElement('table'),
			tr    = document.createElement('tr'),
			td    = document.createElement('td');

		table.style.width = (22 * lbrW) + 'px';
		table.style.height = (22 * lbrH) + 'px';

		ELE.lbrBox.innerHTML = null;
		ELE.lbrBox.appendChild(table);

		for (var y = 0; y < lbrH; y++) {

			var trClone = tr.cloneNode();
			table.appendChild(trClone);

			for (var x = 0; x < lbrW; x++) {

				var tdClone = td.cloneNode(),
					cellVal = lbrCells[y][x];

				tdClone.addEventListener('click', tryToGoToCell);

				if (force || ELE.displayWhile.checked) {
					if (cellVal & 8) {
						tdClone.style.borderTop = '1px solid black';
					}
					if (cellVal & 4) {
						tdClone.style.borderRight = '1px solid black';
					}
					if (cellVal & 2) {
						tdClone.style.borderBottom = '1px solid black';
					}
					if (cellVal & 1) {
						tdClone.style.borderLeft = '1px solid black';
					}
					// tdClone.textContent = lbrCheckCells[y][x];
				}

				trClone.appendChild(tdClone);
				tdClone.setAttribute('id', getCellIdByCoords(x, y));
			}
		}

		document.getElementById(getCellIdByCoords(currentCell.x, currentCell.y))
			.style.backgroundColor = '#cff';

		if (farestCell) {
			document.getElementById(getCellIdByCoords(farestCell.x, farestCell.y))
				.style.backgroundColor = '#fcf';
			console.log('--- ', farestCell.z);
		}
	}
});
