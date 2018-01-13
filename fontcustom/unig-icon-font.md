https://fontcustom.github.io/fontcustom/


### update Font
```
cd web/modules/unig/fontcustom
fontcustom compile vectors
```


### Install Tools:

Install fontcustom
```
brew install fontforge --with-python
brew install eot-utils
sudo gem install fontcustom
```

Install woff2 font compression
```
git clone --recursive https://github.com/google/woff2.git
cd woff2
make clean all
```

move woff2 binaries to /usr/local/bin
```
sudo chmod +x woff2_compress woff2_decompress woff2_info
sudo cp woff2_compress /usr/local/bin/
sudo cp woff2_decompress /usr/local/bin/
sudo cp woff2_info /usr/local/bin/
```


