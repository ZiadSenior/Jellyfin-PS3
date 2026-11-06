import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPs3PkgBlob, CURRENT_RELEASE_METADATA } from './pkgGenerator';

test('buildPs3PkgBlob generates binary with valid 0x7F504B47 PS3 PKG magic header', async () => {
  const blob = buildPs3PkgBlob('http://localhost:3000');
  assert.ok(blob.size > 1024, 'Blob must contain header and payload');

  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Check magic 0x7F, 'P', 'K', 'G'
  assert.equal(bytes[0], 0x7f);
  assert.equal(bytes[1], 0x50); // P
  assert.equal(bytes[2], 0x4b); // K
  assert.equal(bytes[3], 0x47); // G

  // Check Content ID at offset 0x30
  const contentId = 'UP0001-JELLY0001_00-0000000000000000';
  for (let i = 0; i < contentId.length; i++) {
    assert.equal(bytes[0x30 + i], contentId.charCodeAt(i));
  }
});

test('CURRENT_RELEASE_METADATA specifies titleId and universal HEN 4.89-4.93 targets', () => {
  assert.equal(CURRENT_RELEASE_METADATA.titleId, 'JELLY0001');
  assert.equal(CURRENT_RELEASE_METADATA.firmwareMin, '4.89');
  assert.ok(CURRENT_RELEASE_METADATA.targetFirmwares.includes('4.93'));
});
