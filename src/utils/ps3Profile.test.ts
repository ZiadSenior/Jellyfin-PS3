import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPs3DeviceProfile,
  buildJellyfinStreamUrl,
  createDefaultPs3Status,
  generatePs3PkgManifest
} from './ps3Profile';

test('getPs3DeviceProfile specifies H.264 1080p profile and external subtitle handlers', () => {
  const profile = getPs3DeviceProfile('4.93');
  assert.equal(profile.maxVideoWidth, 1920);
  assert.equal(profile.maxVideoHeight, 1080);
  assert.equal(profile.directPlayProfiles[0].videoCodec, 'h264');

  // Verify external subtitle support for srt, ass, pgssub
  const srtSub = profile.subtitleProfiles.find(s => s.format === 'srt');
  const assSub = profile.subtitleProfiles.find(s => s.format === 'ass');
  const pgsSub = profile.subtitleProfiles.find(s => s.format === 'pgssub');

  assert.ok(srtSub, 'SRT subtitle profile exists');
  assert.ok(assSub, 'ASS subtitle profile exists');
  assert.ok(pgsSub, 'PGS subtitle profile exists');
});

test('buildJellyfinStreamUrl includes audio and subtitle stream indexes', () => {
  const url = buildJellyfinStreamUrl({
    serverUrl: 'http://192.168.1.100:8096',
    itemId: 'movie-12345',
    audioStreamIndex: 2,
    subtitleStreamIndex: 4,
    playMethod: 'DirectStream'
  });

  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get('AudioStreamIndex'), '2');
  assert.equal(parsed.searchParams.get('SubtitleStreamIndex'), '4');
  assert.equal(parsed.searchParams.get('VideoCodec'), 'h264');
  assert.equal(parsed.searchParams.get('MaxWidth'), '1920');
});

test('generatePs3PkgManifest produces correct metadata for 4.89-4.93 HEN', () => {
  const manifest = generatePs3PkgManifest('http://192.168.1.50:3000', '4.93');
  assert.equal(manifest.titleId, 'JELLY0001');
  assert.equal(manifest.minFirmware, '4.89');
  assert.ok(manifest.henTested.includes('4.89'));
  assert.ok(manifest.henTested.includes('4.93'));
});
