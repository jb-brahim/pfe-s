const { spawn } = require('child_process');

const PORT = 5001;
process.env.PORT = PORT;

console.log(`🚀 STARTING SMARTFACTURE TEST RUNNER...`);

const server = spawn('node', ['server.js'], {
  env: { ...process.env, PORT: PORT }
});

let testStarted = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(`[SERVER] ${output}`);
  
  if (!testStarted && output.includes('MongoDB Connected')) {
    testStarted = true;
    console.log('\n📡 SERVER READY. WAITING 3 SECONDS FOR NETWORK STABILIZATION...');
    
    setTimeout(() => {
      console.log('🧪 STARTING TEST SUITE...\n');
      const tests = spawn('node', ['test_all.js'], {
        env: { ...process.env, PORT: PORT },
        stdio: 'inherit'
      });

      tests.on('close', (code) => {
        console.log(`\n🏁 TESTS FINISHED WITH CODE ${code}`);
        server.kill();
        process.exit(code);
      });
    }, 3000);
  }
});

server.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR] ${data.toString()}`);
});

setTimeout(() => {
    if (!testStarted) {
        console.log('⚠️ Server taking too long to connect to MongoDB. Forcing test start...');
        testStarted = true;
        // try anyway
         const tests = spawn('node', ['test_all.js'], {
            env: { ...process.env, PORT: PORT },
            stdio: 'inherit'
          });
          tests.on('close', (code) => {
            server.kill();
            process.exit(code);
          });
    }
}, 15000);
