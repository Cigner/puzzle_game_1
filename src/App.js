import React, { useEffect, useState } from 'react';
import { Grid } from 'react-loader-spinner';
import './index';

const App = () => {
  const [gridSize, setGridSize] = useState(3);
  const [image, setImage] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const handleGridChange = (e) => {
    setGridSize(parseInt(e.target.value));
    if(image) {
      createGrid(e.target.value, image);
    }
  }

  const handleImageUpload = (e) => {
    setImage(null);
    const file = e.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          setImage(cropImage(img));
        }

        img.src = ev.target.result;
      }

      reader.readAsDataURL(file);
    }
  } 

  const cropImage = (img) => {
    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');

    const size = Math.min(img.width, img.height);
    canvas.width = size;
    canvas.height = size;

    canvasContext.drawImage(
      img,
      (img.width - size) / 2,
      (img.height - size) / 2,
      size,
      size,
      0,
      0,
      size,
      size,
    );

    const croppedImage = new Image();
    croppedImage.src = canvas.toDataURL();
    return croppedImage;
  }

  useEffect(() => {
    if(image) {
      createGrid(gridSize, image);
    }
  }, image);

  const createGrid = (size, img) => {
    const newPieces = [];
    const pieceSize = img.width / size;

    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

    canvasContext.drawImage(img, 0, 0, img.width, img.height);

    for(let row = 0; row < size; row++) {
      for(let col = 0; col < size; col++) {

        if( row === size - 1 && col === size - 1) continue;

        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = pieceSize;
        pieceCanvas.height = pieceSize;
        const pieceCanvasContext = pieceCanvas.getContext('2d');

        pieceCanvasContext.drawImage(
          canvas,
          col * pieceSize,
          row * pieceSize,
          pieceSize,
          pieceSize,
          0,
          0,
          pieceSize,
          pieceSize
        );

        const piece = {
          id: row * size + col + 1,
          position: row * size + col + 1,
          backgroundImage: `url(${pieceCanvas.toDataURL()})`,
          backgroundSize: `${100}% ${100}%`,
          backgroundPosition: `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`,
        };

        newPieces.push(piece);
      }
    }

    newPieces.push({
      id: size * size,
      position: size * size,
      empty: true,
    });

    newPieces.sort(() => Math.random() - 0.5);

    let positionIndicator = 1;
    newPieces.forEach(element => {
      element.position = positionIndicator;
      positionIndicator++;
    });

    setPieces(newPieces);
  }

  const handlePieceClick = (piece) => {
    const emptyPiece = pieces.find(p => p.empty);
    if(isAdjacent(piece.position, emptyPiece.position)) {
      let newPieces = swapPositions(piece, emptyPiece);
      checkForWin(newPieces);
    }
  }

  const isAdjacent = (pos1, pos2) => {
    const [row1, col1] = [(pos1 - 1) / gridSize | 0, (pos1 -1) % gridSize];
    const [row2, col2] = [(pos2 - 1) / gridSize | 0, (pos2 -1) % gridSize];
    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
  }

  const swapPositions = (piece1, piece2) => {
    const newPieces = pieces.map(piece => {
      if(piece.id === piece1.id) return {...piece, position: piece2.position};
      if(piece.id === piece2.id) return {...piece, position: piece1.position};
      return piece;
    });
    setPieces(newPieces);
    return newPieces;
  }

  const checkForWin = (newPieces) => {
    let notMatch = false;
    newPieces.forEach(async(element) => {
      if(element.id != element.position) {
        notMatch = true;
      }
    });

    if(!notMatch) {
      setGameOver(true);
    }
  }

  const restartGame = () => {
    setGameOver(false);
    setImage(null);
    setGridSize(3);
    setPieces([]);
  }

  return (
    <div className="App">
      <h1>Heck I'm bored :)</h1>
      <div className='form'>
        <label>How hard this should be?</label>
        <input type='number' min='2' max='9' value={gridSize} onChange={handleGridChange}/>
        <label>Select something funny I don't care</label>
        <input type='file' accept='image/*' onChange={handleImageUpload}/>
        {image && (
          <div className='imageView'>
            <span>You wanna that one? Really? Fine, be my guest.</span>
            <img src={image.src} />  
          </div>
        )}
        {image && (
          <div className='grid-container'>
            <div className='grid' style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}>
              {pieces.map(piece => (
                <div key={piece.id} className={`grid-item ${piece.empty ? 'empty' : ''}`}
                style={{ backgroundImage: piece.backgroundImage, width: `${100 / gridSize}%`, height: `${100 / gridSize}%`, transform: `translate(${((piece.position - 1) % gridSize) * 100}%, ${Math.floor((piece.position - 1) / gridSize) * 100}%)` }}
                onClick={() => !piece.empty && handlePieceClick(piece)} />
              ))}
            </div>
          </div>
        )}
        {!image && (
          <Grid visible={true}
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="grid-loading"
          radius="12.5"
          wrapperStyle={{}}
          wrapperClass="grid-wrapper"  />
        )}
        {gameOver && (
          <div className='game-over'>
            <span>Congrats I guess.</span>
            <button onClick={restartGame}>Restart</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
