"""
LangGraph router: simple, reliable intent-based dispatch.
Graph: START → router_node → agent_node → END

The router reads state["intent"] and routes to the correct agent.
No complex graph orchestration — clean and maintainable.
"""
from typing import Literal

from langgraph.graph import StateGraph, END

from app.agents.citation_agent import CitationAgent
from app.agents.summarizer_agent import SummarizerAgent
from app.agents.quiz_agent import QuizAgent
from app.agents.comparison_agent import ComparisonAgent
from app.agents.research_agent import ResearchAgent

# ── Agent instances (singleton per process) ───────────────────────────────────
_citation_agent = CitationAgent()
_summarizer_agent = SummarizerAgent()
_quiz_agent = QuizAgent()
_comparison_agent = ComparisonAgent()
_research_agent = ResearchAgent()


# ── Node functions ────────────────────────────────────────────────────────────

def router_node(state: dict) -> dict:
    """
    Routing node: reads intent and sets the `next_agent` field.
    This drives the conditional edge that follows.
    """
    intent = state.get("intent", "qa")
    valid_intents = {"qa", "summary", "quiz", "compare", "research"}
    if intent not in valid_intents:
        state["intent"] = "qa"
    return state


def qa_node(state: dict) -> dict:
    return _citation_agent.run(state)


def summary_node(state: dict) -> dict:
    return _summarizer_agent.run(state)


def quiz_node(state: dict) -> dict:
    return _quiz_agent.run(state)


def compare_node(state: dict) -> dict:
    return _comparison_agent.run(state)


def research_node(state: dict) -> dict:
    return _research_agent.run(state)


# ── Routing function ──────────────────────────────────────────────────────────

def route_by_intent(state: dict) -> str:
    """Returns the name of the next node based on intent."""
    intent = state.get("intent", "qa")
    routing_map = {
        "qa": "qa_node",
        "summary": "summary_node",
        "quiz": "quiz_node",
        "compare": "compare_node",
        "research": "research_node",
    }
    return routing_map.get(intent, "qa_node")


# ── Graph construction ────────────────────────────────────────────────────────

def build_graph() -> StateGraph:
    """Build and compile the LangGraph workflow."""
    graph = StateGraph(dict)

    # Add nodes
    graph.add_node("router_node", router_node)
    graph.add_node("qa_node", qa_node)
    graph.add_node("summary_node", summary_node)
    graph.add_node("quiz_node", quiz_node)
    graph.add_node("compare_node", compare_node)
    graph.add_node("research_node", research_node)

    # Entry point
    graph.set_entry_point("router_node")

    # Conditional routing from router → agent
    graph.add_conditional_edges(
        "router_node",
        route_by_intent,
        {
            "qa_node": "qa_node",
            "summary_node": "summary_node",
            "quiz_node": "quiz_node",
            "compare_node": "compare_node",
            "research_node": "research_node",
        },
    )

    # All agent nodes → END
    for node in ["qa_node", "summary_node", "quiz_node", "compare_node", "research_node"]:
        graph.add_edge(node, END)

    return graph.compile()


# ── Compiled graph singleton ──────────────────────────────────────────────────
_graph = None


def get_graph():
    """Return the compiled graph (lazy singleton)."""
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


def run_workflow(state: dict) -> dict:
    """
    Execute the LangGraph workflow with the given state dict.
    Returns the final state after agent execution.
    """
    graph = get_graph()
    result = graph.invoke(state)
    return result
