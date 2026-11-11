#!/usr/bin/env node
/**
 * GoreeCloud UI platform token bridge.
 * Generates deterministic foundation-only resources (NOT native component SDKs).
 * No dependencies, network requests, telemetry or external tools.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const src = JSON.parse(readFileSync(join(root, "tokens/gc.tokens.json"), "utf8"));
const accents = ["iris", "lagoon", "ember", "moss"];
const modes = ["light", "dark"];
const roles = ["canvas", "surface", "surface-tonal", "text", "text-soft", "outline", "outline-soft",
  "positive", "on-positive", "warning", "on-warning", "negative", "on-negative",
  "lens-fill", "lens-solid", "scrim", "focus-ring", "brand", "on-brand",
  "brand-container", "on-brand-container"];

function components(value) {
  if (typeof value !== "string") throw new TypeError("A color must be a string");
  if (/^#[a-f\d]{6}$/i.test(value)) {
    return [Number.parseInt(value.slice(1,3),16), Number.parseInt(value.slice(3,5),16), Number.parseInt(value.slice(5,7),16), 1];
  }
  if (/^rgba\([0-9.,\s]+\)$/.test(value)) {
    const parts = value.slice(5,-1).split(",").map((v)=>Number(v.trim()));
    if (parts.length !== 4 || parts.some((v) => !Number.isFinite(v)) || parts.slice(0,3).some((v) => v<0 || v>255 || !Number.isInteger(v)) || parts[3]<0 || parts[3]>1) {
      throw new RangeError("Invalid rgba color");
    }
    return parts;
  }
  throw new TypeError("Only opaque six-digit hex and numeric rgba colors are supported");
}
function argb(value) {
  const [r,g,b,a] = components(value);
  return "#" + [Math.round(a*255),r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase();
}
function pretty(key) {
  return key.replace(/(^|[-_])([a-z])/g, (_, _sep, char)=>char.toUpperCase());
}
function snake(key) { return key.replaceAll("-", "_"); }
function bundle(accent, mode) {
  const combined = { ...src.semantic[mode], ...src.accents[accent][mode] };
  for (const name of roles) if (!(name in combined)) throw new Error("Missing semantic color: " + accent + "/" + mode + "/" + name);
  return Object.fromEntries(roles.map((name)=>[name, combined[name]]));
}
function verify() {
  if (src.meta.name !== "GoreeCloud UI") throw new Error("Unexpected design authority");
  const matrix={};
  for (const accent of accents) {
    if (!src.accents[accent]) throw new Error("Missing accent " + accent);
    for (const mode of modes) {
      const key = accent+"/"+mode;
      matrix[key]=bundle(accent,mode);
      for (const value of Object.values(matrix[key])) components(value);
    }
  }
  return matrix;
}
const matrix = verify();
const heading = "Generated from tokens/gc.tokens.json by scripts/export-platform-tokens.mjs. DO NOT EDIT.";
const flat = Object.entries(matrix).flatMap(([name,colors]) => Object.entries(colors).map(([role,color]) => {
  const [accent,mode]=name.split("/");
  return { accent,mode,role,color,key:accent+"_"+mode+"_"+snake(role),camel:pretty(accent)+pretty(mode)+pretty(role) };
}));

// Standalone resources carry all eight palettes; consuming apps select active values at runtime.
// Color-only adapters do not implement native layout, controls, animations or OS accessibility.
const android = ['<?xml version="1.0" encoding="utf-8"?>',
  '<!-- '+heading+' -->','<resources>',
  ...flat.map(x=>'  <color name="gc_'+x.key+'">'+argb(x.color)+'</color>'),
  '</resources>',''].join("\n");
const xaml = ['<?xml version="1.0" encoding="utf-8"?>',
  '<!-- '+heading+' -->',
  '<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">',
  ...flat.map(x=>'  <Color x:Key="Gc'+x.camel+'">'+argb(x.color)+'</Color>'),
  '</ResourceDictionary>',''].join("\n");
const gtk = ['/* '+heading+' */',
  ...flat.map(x=>'@define-color gc_'+x.key+' '+x.color+';'), ''].join("\n");
const swift = ['// '+heading,'import SwiftUI','','public enum GCUIColors {',
  ...Object.entries(matrix).map(([name, colors])=>{
    const [accent,mode]=name.split("/");
    const rows=Object.entries(colors).map(([role,color])=>{
      const [r,g,b,a]=components(color);
      return '    "'+role+'": Color(.sRGB, red: '+(r/255).toFixed(6)+', green: '+(g/255).toFixed(6)+', blue: '+(b/255).toFixed(6)+', opacity: '+a.toFixed(4)+')';
    });
    return '  public static let '+accent+pretty(mode)+': [String: Color] = [\n'+rows.join(",\n")+'\n  ]';
  }),
  '}',''].join("\n");
const kotlin = ['// '+heading,'package com.goreecloud.ui.tokens','','object GCUIColors {',
  ...Object.entries(matrix).map(([name, colors])=>{
    const [accent,mode]=name.split("/");
    return '  val '+accent+pretty(mode)+': Map<String, Long> = mapOf(\n'+
      Object.entries(colors).map(([role,color])=>'    "'+role+'" to 0x'+argb(color).slice(1)+'L').join(",\n")+
      '\n  )';
  }),
  '}',''].join("\n");
const dimensions = ['<?xml version="1.0" encoding="utf-8"?>','<!-- '+heading+' -->','<resources>',
  ...Object.entries(src.foundations.space).map(([name,val])=>'  <dimen name="gc_space_'+name+'">'+val.replace("px","dp")+'</dimen>'),
  ...Object.entries(src.foundations.radius).filter(([name])=>name!=="full").map(([name,val])=>'  <dimen name="gc_radius_'+name+'">'+val.replace("px","dp")+'</dimen>'),
  '</resources>',''].join("\n");

const outputs={
  "GCUI.palettes.json":JSON.stringify({schemaVersion:1,name:"GoreeCloud UI",status:"alpha-platform-bridge",palettes:matrix,spacing:src.foundations.space,radius:src.foundations.radius,motion:src.foundations.motion},null,2)+"\n",
  "android/gc-colors.xml":android,
  "android/gc-dimensions.xml":dimensions,
  "swift/GCUIColors.swift":swift,
  "windows/GCUIColors.xaml":xaml,
  "gtk/gc-colors.css":gtk
};
const args=process.argv.slice(2);
if (args.some(a=>a!=="--check" && a!=="--write")) throw new Error("Use --check or --write");
if (args.includes("--check") && args.includes("--write")) throw new Error("Choose one mode");
const check=args.includes("--check");
for (const [relative,output] of Object.entries(outputs)) {
  const target=join(root,"platform/generated",relative);
  if (check) {
    let current;
    try { current=readFileSync(target,"utf8"); } catch { throw new Error("Missing generated resource: "+relative); }
    if (current!==output) throw new Error("Platform token export is stale: "+relative);
  } else {
    mkdirSync(dirname(target),{recursive:true});
    writeFileSync(target,output,"utf8");
  }
}
console.log(check?"Platform outputs match canonical tokens":"Generated "+Object.keys(outputs).length+" platform resource files");
