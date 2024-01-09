import { ChangeEventHandler, Dispatch, FC, SetStateAction } from 'react';
import './NumberInput.scss';

export const NumberInput: FC<{
	disabled: boolean;
	value: number;
	setter: Dispatch<SetStateAction<number>>;
	label: string;
	min?: number;
	max?: number;
}> = ({ disabled, value, setter, label, min = 1, max = 10 }) => {
	const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		set(parseInt(e.target.value));
	};

	const increment = () => {
		set(value + 1);
	};

	const decrement = () => {
		set(value - 1);
	};

	const set = (n: number) => {
		n = n > max ? max : n < min ? min : n;
		setter(n);
	};

	return (
		<div className='NumberInput'>
			<input disabled={disabled} type='number' value={value} onChange={onChange} min={min} max={max} />
			<p>{label}</p>
			<input type='button' value='+' className='increment' onClick={increment} disabled={disabled} />
			<input type='button' value='-' className='decrement' onClick={decrement} disabled={disabled} />
		</div>
	);
};
