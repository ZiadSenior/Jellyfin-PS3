import test from 'node:test';
import assert from 'node:assert/strict';
import {
  stripAssTags,
  parseAssTimestamp,
  parseAssFile,
  parseSrtTimestamp,
  parseSrt,
  getActiveCue
} from './subtitles';

test('stripAssTags strips karaoke, positional, and color tags into clean text', () => {
  const assRaw = '{\\k12}Hello {\\pos(192,450)\\c&H00FFFF&}World!{\\r}';
  const clean = stripAssTags(assRaw);
  assert.equal(clean, 'Hello World!');
});

test('stripAssTags converts \\N and \\n into newlines and strips formatting', () => {
  const assRaw = '{\\an8\\fad(200,200)}First line\\N{\\i1}Second line{\\i0}';
  const clean = stripAssTags(assRaw);
  assert.equal(clean, 'First line\nSecond line');
});

test('parseAssTimestamp converts H:MM:SS.cc into seconds', () => {
  const seconds = parseAssTimestamp('0:01:23.45');
  assert.ok(Math.abs(seconds - 83.45) < 0.001);

  const seconds2 = parseAssTimestamp('1:15:00.00');
  assert.equal(seconds2, 4500);
});

test('parseAssFile parses full ASS content into plain text cues', () => {
  const assSample = `
[Script Info]
Title: Sample Anime Subs
ScriptType: v4.00+

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:04.50,Default,,0,0,0,,{\\pos(300,500)\\c&H00FF00&}Look at the stars!
Dialogue: 0,0:00:05.00,0:00:08.20,Default,,0,0,0,,{\\k10}They are {\\k20}shining bright.\\N{\\i1}Indeed.{\\i0}
`;
  const cues = parseAssFile(assSample);
  assert.equal(cues.length, 2);
  assert.equal(cues[0].text, 'Look at the stars!');
  assert.equal(cues[0].startTime, 1);
  assert.equal(cues[0].endTime, 4.5);
  assert.equal(cues[1].text, 'They are shining bright.\nIndeed.');
  assert.equal(cues[1].startTime, 5);
  assert.equal(cues[1].endTime, 8.2);
});

test('parseSrt parses SubRip file correctly', () => {
  const srtSample = `
1
00:00:02,500 --> 00:00:05,000
<i>Welcome aboard the PS3 Jellyfin client.</i>

2
00:00:06,100 --> 00:00:09,800
1080p high bitrate stream verified.
`;
  const cues = parseSrt(srtSample);
  assert.equal(cues.length, 2);
  assert.equal(cues[0].text, 'Welcome aboard the PS3 Jellyfin client.');
  assert.ok(Math.abs(cues[0].startTime - 2.5) < 0.001);
  assert.ok(Math.abs(cues[0].endTime - 5.0) < 0.001);
  assert.equal(cues[1].text, '1080p high bitrate stream verified.');
});

test('getActiveCue returns the correct cue at timestamp', () => {
  const cues = [
    { id: '1', startTime: 2, endTime: 5, text: 'First line' },
    { id: '2', startTime: 6, endTime: 10, text: 'Second line' }
  ];

  assert.equal(getActiveCue(cues, 1), null);
  assert.equal(getActiveCue(cues, 3.5)?.text, 'First line');
  assert.equal(getActiveCue(cues, 5.5), null);
  assert.equal(getActiveCue(cues, 7)?.text, 'Second line');
  // Offset test (+1 second offset)
  assert.equal(getActiveCue(cues, 1.5, 1.0)?.text, 'First line');
});
