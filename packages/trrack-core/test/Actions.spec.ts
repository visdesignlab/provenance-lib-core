import {
  initialState,
  setupProvenanceAndAction,
  setupTodoManager,
} from './helper';
import { ActionType, getState } from '../src';
import { Meta, isChildNode } from '../src/Types/Nodes';

describe('action object is valid', () => {
  const { action } = setupProvenanceAndAction(initialState);

  it('action object should not be null', () => {
    expect(action).not.toBeNull();
  });
});

describe('apply action should work properly', () => {
  it('should throw error when applying action without setting label', () => {
    const { provenance, action } = setupProvenanceAndAction(
      initialState,
      false,
    );

    expect(() => provenance.apply(action)).toThrowError(
      new Error('Please specify a label for the action'),
    );
  });

  it('new node should have correct label', () => {
    const { provenance, action } = setupProvenanceAndAction(initialState);
    const label = 'Increase counter by 1';
    action.setLabel(label);
    provenance.apply(action);

    expect(provenance.current.label).toBe(label);
  });

  it('new node should have correct action type', () => {
    const { provenance, action } = setupProvenanceAndAction(initialState);
    const label = 'Increase counter by 1';
    action.setLabel(label).setActionType('Ephemeral');
    provenance.apply(action);

    expect(provenance.current.actionType).toBe<ActionType>('Ephemeral');
  });

  it('should increment counter value by 1', () => {
    const { provenance, action } = setupProvenanceAndAction(initialState);

    const originalValue = getState(provenance.graph, provenance.current)
      .counter;
    provenance.apply(action.setLabel('Increase Counter'));
    const newValue = getState(provenance.graph, provenance.current).counter;

    expect(newValue - originalValue).toEqual(1);
  });

  it('should change message according to argument', () => {
    const { provenance, changeMessageAction } = setupProvenanceAndAction(
      initialState,
    );

    const msg = 'Hello, World!';
    provenance.apply(changeMessageAction.setArgs([msg]));
    const newMessage = provenance.getState(provenance.current).message;
    expect(newMessage).toEqual(msg);
  });

  it('should set metadata', () => {
    const { provenance, action } = setupProvenanceAndAction(initialState);

    const val = 'Hello, World!';
    const meta: Meta = {
      testMetaData: val,
    };

    provenance.apply(action.setLabel('Increment counter').setMetaData(meta));

    const currentNode = provenance.current;
    if (isChildNode(currentNode)) {
      expect(currentNode.metadata.testMetaData).toEqual(val);
    } else {
      throw new Error('Should not be root node');
    }
  });

  it('should set event type', () => {
    const { provenance, action } = setupProvenanceAndAction(initialState);

    provenance.apply(
      action.setLabel('Increment Counter').setEventType('IncreaseCounter'),
    );

    const currentNode = provenance.current;
    if (isChildNode(currentNode)) {
      expect(currentNode.metadata.eventType).toEqual('IncreaseCounter');
    } else {
      throw new Error('Should not be root node');
    }
  });

  it('should save diff', () => {
    const { provenance, changeName, addTodoAction } = setupTodoManager();

    provenance.apply(changeName.setArgs(['New Name']));
    provenance.apply(
      addTodoAction.setArgs([
        {
          title: 'Task 1',
          description: 'This is a test task',
          status: 'incomplete',
        },
      ]),
    );

    expect('diffs' in provenance.current).toEqual(true);
  });

  it('should save complete state', () => {
    const { provenance, changeName, addTodoAction } = setupTodoManager();

    provenance.apply(changeName.setArgs(['New Name']));
    provenance.apply(
      addTodoAction
        .setArgs([
          {
            title: 'Task 1',
            description: 'This is a test task',
            status: 'incomplete',
          },
        ])
        .saveStateMode('Complete'),
    );

    expect('state' in provenance.current).toEqual(true);
  });
});