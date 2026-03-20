const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function packageProject() {
  try {
    console.log('🚀 Iniciando o build do projeto...');
    // Executa o build do Vite
    execSync('npm run build', { stdio: 'inherit' });

    const distPath = path.join(__dirname, '../dist');
    const zipPath = path.join(__dirname, '../dist-hostinger.zip');

    // Verifica se a pasta dist foi criada
    if (!fs.existsSync(distPath)) {
      console.error('❌ Erro: Pasta dist não encontrada. O build falhou?');
      return;
    }

    console.log('📦 Criando arquivo ZIP para Hostinger...');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log('\n' + '='.repeat(40));
      console.log('✅ SUCESSO!');
      console.log(`📄 Arquivo: dist-hostinger.zip`);
      console.log(`📊 Tamanho: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      console.log('='.repeat(40));
      console.log('👉 Agora basta fazer o upload deste ZIP para a Hostinger.');
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);

    // Adiciona o conteúdo da pasta dist ao ZIP
    // O .htaccess já estará lá pois o Vite copia tudo da pasta public/
    archive.directory(distPath, false);

    await archive.finalize();
  } catch (error) {
    console.error('❌ Ocorreu um erro durante o processo:', error.message);
  }
}

packageProject();