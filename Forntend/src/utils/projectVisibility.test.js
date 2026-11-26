import test from "node:test";
import assert from "node:assert/strict";
import { getVisibleProjects } from "./projectVisibility.js";

test("admins and managers see all projects", () => {
  const projects = [
    { _id: "1", name: "NextGen Cloud Platform" },
    { _id: "2", name: "Real-Time Messaging Platform" },
  ];

  assert.deepEqual(getVisibleProjects(projects, { role: "admin" }), projects);
  assert.deepEqual(getVisibleProjects(projects, { role: "manager" }), projects);
});

test("members only see non-demo projects", () => {
  const projects = [
    { _id: "1", name: "NextGen Cloud Platform" },
    { _id: "2", name: "Real-Time Messaging Platform" },
    { _id: "3", name: "Mobile App Redesign 2.0" },
  ];

  assert.deepEqual(getVisibleProjects(projects, { role: "member" }), [
    { _id: "2", name: "Real-Time Messaging Platform" },
  ]);
});

test("members ignore demo projects regardless of casing and whitespace", () => {
  const projects = [
    { _id: "1", name: "  nextgen cloud platform  " },
    { _id: "2", name: "real-time messaging platform" },
    { _id: "3", name: "mobile app redesign 2.0" },
    { _id: "4", name: "Project Alpha", demo: true },
  ];

  assert.deepEqual(getVisibleProjects(projects, { role: " MEMBER " }), [
    { _id: "2", name: "real-time messaging platform" },
  ]);
});

test("unknown or missing roles should not hide projects", () => {
  const projects = [{ _id: "1", name: "NextGen Cloud Platform" }];

  assert.deepEqual(getVisibleProjects(projects, null), projects);
  assert.deepEqual(getVisibleProjects(projects, {}), projects);
  assert.deepEqual(getVisibleProjects(projects, { role: "guest" }), projects);
});
